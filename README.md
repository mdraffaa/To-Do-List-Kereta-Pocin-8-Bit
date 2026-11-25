# To-Do List Kereta Pocin 8-Bit

todo app fullstack bertema KRL Stasiun Pondok Cina versi game 8-bit, bikinnya pake Next.js sama Firebase buat backend dan login Google-nya.

tiap tugas yang mau dimasukin bakal jadi gerbong KRL di rel peron masing-masing. tiap peron punya rel sama keretanya sendiri (kuliah, kerja, pribadi, atau bikin nama peron sendiri juga sabi), tinggal klik tombol peron atas/bawah di layar kereta biar gampang pindah rel.

yang paling seru pas tugasnya kelar dan pencet berangkatkan, cuma kereta peron itu yang ngerem di stasiun pondok cina, buka pintu, terus nurunin anomali 8-bit tugas lu di peron sambil selebrasi, sementara kereta peron lain tetep jalan terus.

fitur yang ada di sini:
- login pake akun Google, jadi daftar tugas sama skor masinis kesimpen masing-masing di Firestore
- live canvas KRL 8-bit semi-3D yang bisa diklik langsung buat tambah tugas, inspeksi gerbong, ganti cuaca depok, klakson, sama buka pintu
- beda peron beda rel kereta, ada tombol panah atas/bawah buat geser kamera antar rel
- input tanggal pake tap kalender 8-bit dan input jam pake pop-up jam dinding 8-bit (klik pertama jam, kedua menit + AM/PM)
- pengingat tenggat pake notifikasi browser (toa stasiun)

cara jalanin di lokal:
1. `npm install`
2. bikin file `.env.local` terus isi 6 config Firebase you (`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`)
3. nyalain Firestore sama Google Sign-In di Firebase Console
4. `npm run dev` terus buka `http://localhost:3000`
