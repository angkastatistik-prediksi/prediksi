document.addEventListener('DOMContentLoaded', () => {
    // 1. Logika Efek Audio Klik Digital Neon
    const clickSound = document.getElementById('click-sound');
    
    function playClick() {
        if (clickSound) {
            clickSound.currentTime = 0;
            clickSound.play().catch(e => console.log("Audio aktif setelah klik pertama."));
        }
    }

    // Mengaktifkan suara klik pada tombol pasaran utama dan semua link hari harian
    document.querySelectorAll('.pasaran-btn, .hari-link, .back-btn').forEach(element => {
        element.addEventListener('click', playClick);
    });

    // 2. Logika Menurun Kebawah Akordion Pasaran (Hanya berjalan di halaman utama)
    const accordions = document.querySelectorAll('.pasaran-btn');
    if (accordions.length > 0) {
        accordions.forEach(acc => {
            acc.addEventListener('click', function() {
                const container = this.parentElement;
                
                // Tutup pasaran lain yang sedang terbuka agar rapi
                document.querySelectorAll('.pasaran-container').forEach(item => {
                    if (item !== container) item.classList.remove('active');
                });

                // Buka/tutup pasaran yang diklik
                container.classList.toggle('active');
            });
        });
    }

    // 3. Simulasi Trafik Live Pengunjung Aktif (Otomatis menyesuaikan elemen di halaman)
    const counterElement = document.getElementById('visitorCount');
    if (counterElement) {
        setInterval(() => {
            const currentCount = parseInt(counterElement.innerText.replace(',', ''));
            const change = Math.floor(Math.random() * 11) - 5; // Naik turun acak -5 sampai +5
            
            // Batas minimal angka agar web tidak terlihat kosong
            let minLimit = currentCount > 1000 ? 1300 : 300; 
            const finalCount = Math.max(minLimit, currentCount + change);
            
            counterElement.innerText = finalCount.toLocaleString('en-US');
        }, 4000);
    }
});
