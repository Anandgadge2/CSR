-- Create function to prevent UPDATE or DELETE on AuditLog table
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'AuditLog records are append-only and cannot be modified or deleted.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if already exists
DROP TRIGGER IF EXISTS enforce_audit_log_immutability ON "AuditLog";

-- Create trigger on AuditLog
CREATE TRIGGER enforce_audit_log_immutability
BEFORE UPDATE OR DELETE ON "AuditLog"
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_log_modification();
