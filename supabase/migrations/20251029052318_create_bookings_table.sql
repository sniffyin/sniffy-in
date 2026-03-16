/*
  # Create bookings table for Sniffy Pet Partners

  1. New Tables
    - `bookings`
      - `id` (uuid, primary key) - Unique booking identifier
      - `name` (text) - Customer name
      - `phone` (text) - Customer phone number
      - `petType` (text) - Type of pet (Dog/Cat)
      - `breed` (text) - Pet breed
      - `age` (integer) - Pet age in years
      - `medical` (text) - Medical conditions if any
      - `city` (text) - City (Pune)
      - `package` (text) - Selected grooming package
      - `created_at` (timestamptz) - Booking creation timestamp

  2. Security
    - Enable RLS on `bookings` table
    - Add policy for inserting bookings (public access for booking form)
    - Add policy for reading bookings (authenticated users only)
*/

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  petType text NOT NULL,
  breed text NOT NULL,
  age integer NOT NULL,
  medical text DEFAULT '',
  city text NOT NULL,
  package text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert bookings (for the public booking form)
CREATE POLICY "Anyone can create bookings"
  ON bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to view all bookings
CREATE POLICY "Authenticated users can view bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (true);