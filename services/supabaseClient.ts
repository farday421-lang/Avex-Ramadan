
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vxbjnfgmtvxywicchyhz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4YmpuZmdtdHZ4eXdpY2NoeWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNTI4MzEsImV4cCI6MjA4NjgyODgzMX0.quIbbF8pyukHg5WjZKo3ykxPdJuAUtXqgBkusp8UBIg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
