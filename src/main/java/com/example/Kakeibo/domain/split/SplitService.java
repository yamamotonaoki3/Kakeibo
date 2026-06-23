package com.example.Kakeibo.domain.split;

import com.example.Kakeibo.domain.group.ExpenseGroup;
import com.example.Kakeibo.domain.group.GroupRepository;
import com.example.Kakeibo.domain.group.GroupService;
import com.example.Kakeibo.domain.user.User;
import com.example.Kakeibo.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SplitService {

    private final SplitRepository splitRepository;
    private final GroupRepository groupRepository;
    private final GroupService groupService;
    private final UserRepository userRepository;

    public record ShareRequest(Long userId, BigDecimal shareRatio) {}

    public record DebtSummary(Long fromUserId, String fromDisplayName,
                               Long toUserId, String toDisplayName, Long amount) {}

    @Transactional
    public SplitTransaction createSplit(User paidBy, Long groupId, Long totalAmount,
                                        String memo, LocalDate splitDate,
                                        List<ShareRequest> shareRequests) {
        groupService.requireMembership(groupId, paidBy.getId());

        ExpenseGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("グループが見つかりません"));

        BigDecimal totalRatio = shareRequests.stream()
                .map(ShareRequest::shareRatio)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalRatio.subtract(BigDecimal.valueOf(100)).abs().compareTo(BigDecimal.valueOf(0.01)) > 0) {
            throw new IllegalArgumentException("比率の合計が100%になるようにしてください（現在: " + totalRatio + "%）");
        }

        for (ShareRequest req : shareRequests) {
            groupService.requireMembership(groupId, req.userId());
        }

        SplitTransaction splitTx = new SplitTransaction();
        splitTx.setGroup(group);
        splitTx.setTotalAmount(totalAmount);
        splitTx.setPaidBy(paidBy);
        splitTx.setMemo(memo);
        splitTx.setSplitDate(splitDate);

        List<SplitShare> shares = new ArrayList<>();
        long sumAmount = 0;

        for (int i = 0; i < shareRequests.size(); i++) {
            ShareRequest req = shareRequests.get(i);
            User memberUser = userRepository.findById(req.userId())
                    .orElseThrow(() -> new IllegalArgumentException("ユーザーが見つかりません: " + req.userId()));

            long shareAmount;
            if (i == shareRequests.size() - 1) {
                // 端数調整: 最後のシェアで合計を一致させる
                shareAmount = totalAmount - sumAmount;
            } else {
                shareAmount = req.shareRatio()
                        .multiply(BigDecimal.valueOf(totalAmount))
                        .divide(BigDecimal.valueOf(100), 0, RoundingMode.FLOOR)
                        .longValue();
                sumAmount += shareAmount;
            }

            if (shareAmount < 1) { shareAmount = 1; }

            SplitShare share = new SplitShare();
            share.setSplitTransaction(splitTx);
            share.setUser(memberUser);
            share.setShareRatio(req.shareRatio());
            share.setShareAmount(shareAmount);
            shares.add(share);
        }

        splitTx.setShares(shares);
        return splitRepository.save(splitTx);
    }

    @Transactional(readOnly = true)
    public List<SplitTransaction> listSplits(User user, LocalDate from, LocalDate to) {
        List<Long> groupIds = groupRepository.findGroupsByUserId(user.getId())
                .stream().map(g -> g.getId()).toList();
        if (groupIds.isEmpty()) { return List.of(); }
        return splitRepository.findByGroupIdsAndDateRange(groupIds, from, to);
    }

    @Transactional(readOnly = true)
    public List<SplitShare> getShares(Long splitId) {
        return splitRepository.findSharesBySplitId(splitId);
    }

    @Transactional
    public void settleShare(User user, Long shareId) {
        SplitShare share = splitRepository.findShareByIdAndUserId(shareId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("精算対象が見つかりません"));
        share.setIsSettled(true);
        share.setSettledAt(LocalDateTime.now());
        splitRepository.save(share.getSplitTransaction());
    }

    @Transactional(readOnly = true)
    public List<DebtSummary> getSummary(User user, LocalDate from, LocalDate to) {
        List<Long> groupIds = groupRepository.findGroupsByUserId(user.getId())
                .stream().map(g -> g.getId()).toList();
        if (groupIds.isEmpty()) { return List.of(); }

        List<SplitShare> unsettled = splitRepository.findUnsettledSharesByGroupIds(groupIds, from, to);

        // key: "fromUserId:toUserId" → amount
        Map<String, long[]> debtMap = new HashMap<>();

        for (SplitShare share : unsettled) {
            User paidBy = share.getSplitTransaction().getPaidBy();
            User debtor = share.getUser();

            if (paidBy.getId().equals(debtor.getId())) { continue; }

            String key = debtor.getId() + ":" + paidBy.getId();
            String reverseKey = paidBy.getId() + ":" + debtor.getId();

            if (debtMap.containsKey(reverseKey)) {
                debtMap.get(reverseKey)[0] -= share.getShareAmount();
                if (debtMap.get(reverseKey)[0] <= 0) {
                    long remaining = -debtMap.get(reverseKey)[0];
                    debtMap.remove(reverseKey);
                    if (remaining > 0) {
                        debtMap.put(key, new long[]{remaining});
                    }
                }
            } else {
                debtMap.merge(key, new long[]{share.getShareAmount()},
                        (a, b) -> { a[0] += b[0]; return a; });
            }
        }

        List<DebtSummary> result = new ArrayList<>();
        for (Map.Entry<String, long[]> entry : debtMap.entrySet()) {
            if (entry.getValue()[0] <= 0) { continue; }
            String[] ids = entry.getKey().split(":");
            Long fromId = Long.parseLong(ids[0]);
            Long toId = Long.parseLong(ids[1]);

            // 自分が関係するものだけ返す
            if (!fromId.equals(user.getId()) && !toId.equals(user.getId())) { continue; }

            User fromUser = unsettled.stream()
                    .map(s -> s.getUser().getId().equals(fromId) ? s.getUser() :
                             s.getSplitTransaction().getPaidBy().getId().equals(fromId) ?
                             s.getSplitTransaction().getPaidBy() : null)
                    .filter(u -> u != null).findFirst()
                    .orElseThrow();
            User toUser = unsettled.stream()
                    .map(s -> s.getUser().getId().equals(toId) ? s.getUser() :
                             s.getSplitTransaction().getPaidBy().getId().equals(toId) ?
                             s.getSplitTransaction().getPaidBy() : null)
                    .filter(u -> u != null).findFirst()
                    .orElseThrow();

            result.add(new DebtSummary(fromId, fromUser.getDisplayName(),
                    toId, toUser.getDisplayName(), entry.getValue()[0]));
        }
        return result;
    }
}
