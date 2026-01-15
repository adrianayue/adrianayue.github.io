/*  Array dels colors en rgb associats a les hores del dia utilitzant 3 propietats: 
        hour: l'hora d'inflexió
        bgColor: el color de fons en rgb associat a l'hora d'inflexió
        textColor: el color del text en rgb associat a l'hora d'inflexió
*/
const colorsHours = [
    { hour: 0, bgColor: [48, 48, 48], textColor: [247, 236, 217] },        // gris-fosc
    { hour: 3, bgColor: [103, 144, 144], textColor: [48, 48, 48] },        // verdós fosc (punt inflexió canvi de textColor -blanc trencat a gris-)
    { hour: 4, bgColor: [202, 225, 225], textColor: [48, 48, 48] },        // verdos-blau clar
    { hour: 6, bgColor: [216, 230, 230], textColor: [48, 48, 48] },        // blau molt clar    
    { hour: 8, bgColor: [254, 249, 237], textColor: [93, 82, 75] },        // blanc trencat / groc (punt inflexió canvi de textColor -gris a marró fosc-)
    { hour: 10, bgColor: [247, 236, 217], textColor: [93, 82, 75] },       // groc molt clar
    { hour: 13, bgColor: [255, 240, 200], textColor: [93, 82, 75] },       // groc clar
    { hour: 15, bgColor: [246, 229, 184], textColor: [93, 82, 75] },       // groc fosc
    { hour: 17, bgColor: [145, 128, 104], textColor: [247, 236, 217] },    // marró caqui (punt inflexió canvi de textColor -marró fosc a blanc trencat-)
    { hour: 19, bgColor: [95, 78, 65], textColor: [247, 236, 217] },       // marró xocolata
    { hour: 21, bgColor: [93, 82, 75], textColor: [247, 236, 217] },       // marró grisos
    { hour: 24, bgColor: [48, 48, 48], textColor: [247, 236, 217] }        // gris-fosc
];

// Definim l'hora de Barcelona, ja que la web sempre anirà en funció de l'hora actual de Barcelona.
function getBarcelonaTime() {
    const now = new Date();
    
    //  Per fer debugging "Europe/Madrid" "Asia/Tokyo" "Pacific/Honolulu" "Indian/Antananarivo" "America/Sao_Paulo" "Europe/Moscow" "Europe/Kyiv" "Europe/Helsinki"
    const options = { timeZone: "Europe/Madrid", hour12: false, hour: "numeric", minute: "numeric", second: "numeric"};

    // Intl.DateTimeFormat es una API de JavaScript que ens permet formatar dates i hores segons la localització i les opcions especificades. "en-GB" determina el format de 24 hores del Regne Unit, i options especifica la zona horària i el format definit anteriorment
    const format = new Intl.DateTimeFormat("en-GB", options);

    // formatToParts converteix la data now en un array d’objectes
    const parts = format.formatToParts(now);

    /*  Definim les variables per hores, minuts i segons
        El loop for, definint "part" com a constant de "parts", recorre cada part de l'array retornat per formatToParts
        La funció parseInt converteix el valor del string "part.value" a un valor numèrics
    */
    let hours;
    let minutes;
    let seconds;

    for (const part of parts) {
        if (part.type === 'hour') {
            hours = parseInt(part.value)
        }

        if (part.type === 'minute') {
            minutes = parseInt(part.value);
        }

        if (part.type === 'second') {
            seconds = parseInt(part.value);
        }
    }
        return { hours, minutes, seconds };
}

    //  Creem la funció "getColorsNow" per transformar el temps real de "getBarcelonaTime" en valors cromàtics continus, així creem un degradat al llarg del dia definit per l'array "colorsHours".
    function getColorsNow(hours, minutes) {
        const timeDecimal = hours + minutes / 60; // Convertim l'hora i els minuts a un valor decimal per facilitar la interpolació

        let colorInicial = colorsHours[0];
        let colorFinal = colorsHours[colorsHours.length - 1];

        // Es troben els dos colors d'inflexió entre els quals es troba l'hora actual
        for (let i = 0; i < colorsHours.length - 1; i++) {
            if (timeDecimal >= colorsHours[i].hour && timeDecimal < colorsHours[i + 1].hour) {
                colorInicial = colorsHours[i];
                colorFinal = colorsHours[i + 1];
                break;
            }
        }

        // Un cop tenim els colors d'inflexió, es calcula el color actual mitjançant una interpolació lineal 
        //  "t" és un valor entre 0 i 1 que indica la posició relativa de l'hora actual entre els dos punts d'inflexió:   t = (hora actual decimal - punt d'inflexió inicial del tram) / rang
        const range = colorFinal.hour - colorInicial.hour;
        const t = (timeDecimal - colorInicial.hour) / range; 
        

        // Definim el color de fons interpolat i utilitzem la funció "Math.round" per arrodonir els valors en nombres enters, ja que RGB no accepta decimals sent [0]=R, [1]=G, [2]=B
        // La fórmula que calcula el valor[R,G,B] = inici + t · (final − inici)
        const bgColor = [
            Math.round(colorInicial.bgColor[0] + t * (colorFinal.bgColor[0] - colorInicial.bgColor[0])),
            Math.round(colorInicial.bgColor[1] + t * (colorFinal.bgColor[1] - colorInicial.bgColor[1])),
            Math.round(colorInicial.bgColor[2] + t * (colorFinal.bgColor[2] - colorInicial.bgColor[2]))
        ];

        // El color del text volem que sempre sigui accessible i tingui bon contrast, per això no l'interpolem, sinó que es manté constant fins el punt d'inflexió definit
        const textColor = colorInicial.textColor;

        // El color del stroke dels stickers també volem que mantinguin un cert contrast, sense ser molest, pel que definim únicament dos valors i dos punts d'inflexió
        const stickerStrokeColor = (timeDecimal >= 3 && timeDecimal < 17) ? [254, 249, 237] : textColor;

        return { bgColor, textColor, stickerStrokeColor };
    }

    /*  Finalment, creem la funció "updateColors" per actualitzar els colors cada segon
        Un cop cridem als valors de l'hora actual i els colors corresponents, actualitzem les variables CSS amb la constant "root" que accedeix al document HTML.
        A més, utilitzem aquesta funció per mostrar l'hora actual en format hh:mm:ss
    */

    function updateColors() {
        const { hours, minutes, seconds } = getBarcelonaTime();
        const { bgColor, textColor, stickerStrokeColor } = getColorsNow(hours, minutes);

        const root = document.documentElement;
        root.style.setProperty("--bg-color", `rgb(${bgColor.join(",")})`);
        root.style.setProperty("--text-color", `rgb(${textColor.join(",")})`);
        root.style.setProperty("--sticker-stroke-color", `rgb(${stickerStrokeColor.join(",")})`);

        // Mostrar hora en format hh:mm:ss
        const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        document.getElementById("time").textContent = timeString;
    }

    // Cridem la funció immediatament al carregar la pàgina i l'actualitzem cada segon
    updateColors();
    setInterval(updateColors, 1000);
