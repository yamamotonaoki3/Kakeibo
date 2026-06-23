UPDATE split_shares ss
SET is_settled = true
FROM split_transactions st
WHERE ss.split_transaction_id = st.id
  AND ss.user_id = st.paid_by_user_id;
