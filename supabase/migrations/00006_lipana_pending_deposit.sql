-- Allow authenticated users to register a pending Lipana deposit (so we can credit on webhook)
CREATE OR REPLACE FUNCTION public.insert_pending_lipana_deposit(
  p_checkout_request_id TEXT,
  p_transaction_id TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.mpesa_callbacks (
    checkout_request_id,
    user_id,
    merchant_request_id,
    status,
    raw_response,
    created_at
  ) VALUES (
    p_checkout_request_id,
    auth.uid(),
    p_transaction_id,
    'pending',
    jsonb_build_object('provider', 'lipana'),
    NOW()
  )
  ON CONFLICT (checkout_request_id) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.insert_pending_lipana_deposit(TEXT, TEXT) TO authenticated;
