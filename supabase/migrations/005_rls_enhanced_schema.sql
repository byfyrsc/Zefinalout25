CREATE POLICY "Enable read access for all users" ON "public"."restaurants" FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON "public"."restaurants" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on id" ON "public"."restaurants" FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Enable delete for users based on id" ON "public"."restaurants" FOR DELETE USING (auth.uid() = id);