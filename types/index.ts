import { Tables } from './supabase';

type User = Tables<'users'>;

type Resources = Tables<'resources'>;

type Coachings = Tables<'coachings'>;

export type { User, Resources, Coachings };
