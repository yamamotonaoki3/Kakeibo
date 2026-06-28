package com.example.Kakeibo.domain.transfer;

import com.example.Kakeibo.domain.user.User;
import com.example.Kakeibo.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransferService {

    private final TransferRepository transferRepository;
    private final UserRepository userRepository;

    public record DebtSummary(Long fromUserId, String fromDisplayName,
                               Long toUserId, String toDisplayName, Long amount) {}

    @Transactional
    public Transfer createTransfer(User fromUser, Long toUserId, Long amount,
                                   String memo, LocalDate transferDate) {
        if (fromUser.getId().equals(toUserId)) {
            throw new IllegalArgumentException("自分自身への送金は登録できません");
        }
        User toUser = userRepository.findById(toUserId)
                .orElseThrow(() -> new IllegalArgumentException("送金先ユーザーが見つかりません"));

        Transfer transfer = new Transfer();
        transfer.setFromUser(fromUser);
        transfer.setToUser(toUser);
        transfer.setAmount(amount);
        transfer.setMemo(memo);
        transfer.setTransferDate(transferDate);
        return transferRepository.save(transfer);
    }

    @Transactional(readOnly = true)
    public List<Transfer> listTransfers(User user, LocalDate from, LocalDate to) {
        return transferRepository.findByUserIdAndDateRange(user.getId(), from, to);
    }

    @Transactional
    public void settleTransfer(User user, Long transferId) {
        Transfer transfer = transferRepository.findByIdAndUserId(transferId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("送金記録が見つかりません"));
        transfer.setIsSettled(true);
        transfer.setSettledAt(LocalDateTime.now());
        transferRepository.save(transfer);
    }

    @Transactional(readOnly = true)
    public List<DebtSummary> getSummary(User user, LocalDate from, LocalDate to) {
        List<Transfer> unsettled = transferRepository.findUnsettledByUserIdAndDateRange(user.getId(), from, to);

        // fromUser → toUser の合算（双方向を相殺）
        java.util.Map<String, long[]> debtMap = new java.util.HashMap<>();

        for (Transfer t : unsettled) {
            String key = t.getFromUser().getId() + ":" + t.getToUser().getId();
            String reverseKey = t.getToUser().getId() + ":" + t.getFromUser().getId();

            if (debtMap.containsKey(reverseKey)) {
                debtMap.get(reverseKey)[0] -= t.getAmount();
                if (debtMap.get(reverseKey)[0] <= 0) {
                    long remaining = -debtMap.get(reverseKey)[0];
                    debtMap.remove(reverseKey);
                    if (remaining > 0) {
                        debtMap.put(key, new long[]{remaining});
                    }
                }
            } else {
                debtMap.merge(key, new long[]{t.getAmount()},
                        (a, b) -> { a[0] += b[0]; return a; });
            }
        }

        List<DebtSummary> result = new ArrayList<>();
        for (java.util.Map.Entry<String, long[]> entry : debtMap.entrySet()) {
            if (entry.getValue()[0] <= 0) { continue; }
            String[] ids = entry.getKey().split(":");
            Long fromId = Long.parseLong(ids[0]);
            Long toId = Long.parseLong(ids[1]);

            User fromUser = unsettled.stream()
                    .map(t -> t.getFromUser().getId().equals(fromId) ? t.getFromUser() :
                              t.getToUser().getId().equals(fromId) ? t.getToUser() : null)
                    .filter(u -> u != null).findFirst().orElseThrow();
            User toUser = unsettled.stream()
                    .map(t -> t.getFromUser().getId().equals(toId) ? t.getFromUser() :
                              t.getToUser().getId().equals(toId) ? t.getToUser() : null)
                    .filter(u -> u != null).findFirst().orElseThrow();

            result.add(new DebtSummary(fromId, fromUser.getDisplayName(),
                    toId, toUser.getDisplayName(), entry.getValue()[0]));
        }
        return result;
    }
}
