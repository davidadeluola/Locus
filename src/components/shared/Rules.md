# CREATE OR REPLACE FUNCTION initiate_device_reset(user_uuid UUID)
RETURNS void AS $$
BEGIN
  -- Check if they have already reset in the last 24 hours
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_uuid 
    AND last_reset_performed > now() - interval '24 hours'
  ) THEN
    RAISE EXCEPTION 'RESET_LIMIT_REACHED: You can only reset your device once every 24 hours.';
  END IF;

  -- Open the 10-minute window and clear the old hash
  UPDATE profiles 
  SET 
    device_hash = NULL,
    reset_window_expiry = now() + interval '10 minutes',
    last_reset_performed = now()
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql;