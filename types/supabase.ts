export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      coachings: {
        Row: {
          coach_id: string | null
          created_at: string
          formatted_timestamp: string | null
          id: string
          scheduled_date: string | null
          scheduled_time: string | null
          teacher_id: string | null
        }
        Insert: {
          coach_id?: string | null
          created_at?: string
          formatted_timestamp?: string | null
          id?: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          teacher_id?: string | null
        }
        Update: {
          coach_id?: string | null
          created_at?: string
          formatted_timestamp?: string | null
          id?: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coachings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coachings_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          category: string | null
          created_at: string
          creator_id: string | null
          description: string | null
          file_url: string | null
          id: string
          main_goal: string | null
          teacher_id: string | null
          thumbnail_url: string | null
          title: string | null
          topics_covered: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          main_goal?: string | null
          teacher_id?: string | null
          thumbnail_url?: string | null
          title?: string | null
          topics_covered?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          main_goal?: string | null
          teacher_id?: string | null
          thumbnail_url?: string | null
          title?: string | null
          topics_covered?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          id: string
          image_url: string | null
          name: string | null
          role: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
