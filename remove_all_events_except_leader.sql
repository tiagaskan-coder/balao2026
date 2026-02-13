
-- Remove all events except 'leader' from arena_events table
DELETE FROM public.arena_events WHERE id != 'leader';
