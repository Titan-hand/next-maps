import { createClient } from "@/utils/supabase/server";
import { type Note } from "@/types/note";

export default async function Page() {
  const supabase = createClient();
  const { data: notes } = await supabase
    .from("notes")
    .select()
    .returns<Note[]>();

  return <pre>{JSON.stringify(notes, null, 2)}</pre>;
}

// If you want to use it as a client-side rendered page, you can use the following code:
// 'use client'

// import { createClient } from '@/utils/supabase/client'
// import { useEffect, useState } from 'react'

// export default function Page() {
//   const [notes, setNotes] = useState<any[] | null>(null)
//   const supabase = createClient()

//   useEffect(() => {
//     const getData = async () => {
//       const { data } = await supabase.from('notes').select()
//       setNotes(data)
//     }
//     getData()
//   }, [])

//   return <pre>{JSON.stringify(notes, null, 2)}</pre>
// }
