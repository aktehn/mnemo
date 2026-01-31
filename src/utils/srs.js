export function calculateNextReview(currentStats, grade) {
    let { interval, repetition, ef } = currentStats;

    // Varsayılan değerler (eğer ilk kez geliyorsa)
    if (!interval) interval = 0;
    if (!repetition) repetition = 0;
    if (!ef) ef = 2.5;

    // Eğer kullanıcı bilemediyse (Grade < 3), süreci sıfırla veya çok kısalt
    if (grade < 3) {
        repetition = 0;
        interval = 1; // 1 gün sonra tekrar sor
        // EF değişmeyebilir veya biraz düşürülebilir
        return { interval, repetition, ef, dueDate: getFutureDate(interval) };
    }

    // Başarılı hatırlama
    // 1. Yeni EF hesaplama
    // Formül: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    // q = grade
    ef = ef + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));

    // EF asla 1.3'ün altına düşmemeli (sonsuz döngü olmasın)
    if (ef < 1.3) ef = 1.3;

    // 2. Repetition sayısını artır
    repetition += 1;

    // 3. Yeni Interval hesaplama
    if (repetition === 1) {
        interval = 1; // İlk tekrar: 1 gün
    } else if (repetition === 2) {
        interval = 6; // İkinci tekrar: 6 gün
    } else {
        interval = Math.round(interval * ef); // Sonraki: Önceki * EF
    }

    return {
        interval,
        repetition,
        ef: parseFloat(ef.toFixed(2)), // 2 decimal precision
        dueDate: getFutureDate(interval)
    };
}

/**
 * Yardımcı Fonksiyon: Gün sayısı kadar ileri tarihi verir.
 */
function getFutureDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString(); // DB için ISO string
}
