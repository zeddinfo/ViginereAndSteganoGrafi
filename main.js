/*
File berisi fungsi pada aplikasi, mulai dari viginere, enkrip, dekrip dan fungsi stegano
*/

///Fungsi membaca isi file txt
document.getElementById('uploadBtn').addEventListener('change', function() {
    var fr = new FileReader();
    fr.onload = function() {
        document.getElementById('teks').value = fr.result;
        console.log("Teks : " + fr.result);
    };
    fr.readAsText(this.files[0]);
});

///fungsi untuk enkripsi viginere dan menampilkan di textarea
function doCrypt(isDecrypt) {
    if (document.getElementById("key").value.length == 0) {
        alert("Password Kosong");
        return;
    }
    var key = filterKey(document.getElementById("key").value);
    if (key.length == 0) {
        alert("Key/Password tidak boleh angka");
        return;
    }
    if (isDecrypt) {
        for (var i = 0; i < key.length; i++)
            key[i] = (26 - key[i]) % 26;
    }
    var textElem = document.getElementById("output");
    textElem.innerHTML = crypt(document.getElementById('teks').value, key);
    var secret = document.getElementById('teks').value = textElem.innerHTML;
    console.log("Result Viginere : " + secret);
    if (secret != '') {
        $('#btn-download').show();
    } else {
        $('#btn-download').hide();
    }
}

///fungsi untuk menghitung huruf yang sudah dibaca
function crypt(input, key) {
    var output = "";
    for (var i = 0, j = 0; i < input.length; i++) {
        var c = input.charCodeAt(i);
        if (isUppercase(c)) {
            output += String.fromCharCode((c - 65 + key[j % key.length]) % 26 + 65);
            j++;
        } else if (isLowercase(c)) {
            output += String.fromCharCode((c - 97 + key[j % key.length]) % 26 + 97);
            j++;
        } else {
            output += input.charAt(i);
        }
    }
    return output;
}

///fungsi untuk memfilter password
function filterKey(key) {
    var result = [];
    for (var i = 0; i < key.length; i++) {
        var c = key.charCodeAt(i);
        if (isLetter(c))
            result.push((c - 65) % 32);
    }
    return result;
}

///Fungsi untuk huruf karakter validasi(Optional)
function isLetter(c) {
    return isUppercase(c) || isLowercase(c);
}

///Fungsi untuk huruf karakter besar(opsional)
function isUppercase(c) {
    return 65 <= c && c <= 90;
}

// fungsi huruf kecil
function isLowercase(c) {
    return 97 <= c && c <= 122;
}

///Start Stegano

/*Deklarasi variabel dan Mengambil nilai pada HTML*/
var
    myFile = document.getElementById('uploadBtn'),
    canvas = document.getElementById('canvas'),
    secret = document.getElementById('secret'),
    coverAfter = document.getElementById('coverAfter'),
    ctx = canvas.getContext('2d'),
    ctxSecret = secret.getContext('2d'),
    ctxCoverAfter = coverAfter.getContext('2d'),
    loadFile = document.getElementById('loadFile'),
    view,
    clampedArray,
    index = 0;

///membaca file
myFile.addEventListener('change', function(e) {
    var file = e.target.files[0];
    var fr = new FileReader();
    fr.addEventListener("load", loadEvent);

    function loadEvent(evt) {
        if (evt.target.readyState = FileReader.DONE) {
            var arrayBuffer = evt.target.result;
            view = new Uint8Array(arrayBuffer);
        }
    }
    fr.readAsArrayBuffer(file);
});

///Fungsi HideData waktu di klik
hideData.addEventListener('click', function() {
    var
        cover = document.getElementById('cover'),
        file = cover.files[0],
        fr = new FileReader();
    fr.addEventListener("load", loadEvent);
    fr.addEventListener("loadend", loadEndEvent);

    function loadEvent(e) {
        console.info("Sedang di load, tunggu sampai selesai");
    }

    function loadEndEvent(e) {
        console.info("Selesai");
        console.info('View1 :', view);
        var img = new Image();
        img.src = e.target.result;

        img.onload = function() {
            ctx.drawImage(img, 0, 0);
            clampedArray = ctx.getImageData(0, 0, canvas.height, canvas.width);
            console.log(clampedArray);
            console.log(view);
            readByte(view);
            ctxSecret.putImageData(clampedArray, 0, 0);
        }
    }
    fr.readAsDataURL(file);
});

///Untuk meload gambar setelah di klik button hidenya
loadFile.addEventListener('change', function(e) {
    var file = e.target.files[0];
    var fr = new FileReader();

    fr.addEventListener("loadend", loadEndEvent);

    function loadEndEvent(e) {

        var img = new Image();
        img.src = e.target.result;
        // menunggu 3 detik untuk meload gambar
        // kemudian gambar di tampilkan pada class canvas
        img.onload = function() {
            ctxCoverAfter.drawImage(img, 0, 0);
            // mengembalikan ArrayBuffer Object untuk compresi gambar (Opsional)
            //var arrayBuffer = evt.target.result;
            // Mengubah Array Buffer ke Uint8Array
            // 1 byte per index, and only store to 256 values
            //var loadView = new Uint8Array(arrayBuffer);
            var loadView = ctxCoverAfter.getImageData(0, 0, coverAfter.height, coverAfter.width);
            console.log(loadView)
            var totalLength = 0;
            var lastIndex;
            // loop semua pixel bit
            // Jumlahkan semua sesuai panjang array
            for (var b = 0, viewLength = loadView.data.length; b < viewLength; b++) {
                // get the length for matched index only
                if (loadView.data[b] == 255) {
                    totalLength += loadView.data[b];
                    if (loadView.data[b + 1] < 255) {
                        totalLength += loadView.data[b + 1];
                        lastIndex = b + 1;
                        break;
                    }
                } else {
                    totalLength += loadView.data[b];
                    lastIndex = b;
                    break;
                }
            }

            console.info('Total length :' + totalLength + ', Last Index : ' + lastIndex)
                // ambil dari index pertama - panjang secret
            var secretLength = totalLength;
            // inialisasi Unsigned array(8 bit)
            // divided dari 4 jadi 1 karakter untuk 8bit
            var newUint8Array = new Uint8Array(totalLength / 4);
            var j = 0;
            // start extracting the bits from pixel
            for (var i = (lastIndex + 1); i < secretLength; i = i + 4) {

                // kita hanya perlu 2 bit pertama dari setiap byte
                // karena 2bit itu mengandung bit data rahasia kami
                // pertama, bersihkan bit yang tidak digunakan menggunakan mask (3) == 0000 0011
                // lalu bergeser ke kiri untuk setiap bit (memesan)
                // tinggal di lokasi sendiri
                var aShift = (loadView.data[i] & 3);
                var bShift = (loadView.data[i + 1] & 3) << 2;
                var cShift = (loadView.data[i + 2] & 3) << 4;
                var dShift = (loadView.data[i + 3] & 3) << 6;
                // final, merge/combine all shifted bits to form a byte(8bits)
                var result = (((aShift | bShift) | cShift) | dShift);
                // store the result(single byte) into unsigned integer
                newUint8Array[j] = result;
                j++;
            }
            console.log(newUint8Array)
            // console.info('View1 :', view);
            // console.info('View2 :', newUint8Array);
            
            ///compare ke mse dan psnr
            console.info('Matriks Citra Awal : ',comparetoMatrix(view, 3)); ///citra awal
            console.info('Matriks Citra Akhir :',comparetoMatrix(newUint8Array, 3)); ///citra akhir
            console.info('MSE :=> ',compare(view, newUint8Array));
            console.info('PSNR :=> ',psnr(compare(view, newUint8Array), maxValue(view, newUint8Array)));
                // decode menjadi kode ASCII
            var result = decodeUtf8(newUint8Array);
            console.log(result)
                // force download results into .txt files
            saveByteArray(result.split(''), 'stegano.txt');

        }

    }

    // read as dataUrl(base64)
    fr.readAsDataURL(file);
});

function maxValue(value1, value2){
    cawal = Math.max.apply(null, value1);
    cakhir = Math.max.apply(null, value2);
    return Math.max(cawal, cakhir);
}

function comparetoMatrix(list, elementPerSubArray){
    var matrix = [], i, k;

    for(i = 0, k = -1; i < list.length; i++){
        if(i % elementPerSubArray === 0){
            k++;
            matrix[k] = [];
        }
        matrix[k].push(list[i]);
    }
    return matrix;
}

function compare(image1, image2){
    ///mse 
    var total = 0;
    for(var i=0;i<image1.length;i++){
        for(var j=0;j<image2.length;j++){
           total+= Math.pow((image1[i] - image2[j]), 2);
           break;
        }
    }
    var result = total / image1.length;
    return result;
}

function psnr(mse, max){
    return 10 * Math.log10(max/mse);
}

function readByte(secret) {
    for (var i = 0, length = secret.length; i < length; i++) {

        if (i == 0) {
            // pada bit pertama, simpan panjang data rahasia
            // harus dikalikan 4, sebagai kode satu karakter yang berisi
            // 8bits, dengan demikian 8bits ini dibagi 2. Setiap 2 bit harus diganti
            // LSB (Paling sedikit signifikan) dari byte byte
            var secretLength = length * 4;
            console.info('Secret Length(' + length + 'x4) : ' + secretLength)
                // karena imageData kami adalah array yang diketik (Uint8ClampedArray)
                // itu hanya dapat menyimpan nilai tidak lebih dari 256 (8bit atau 1byte)
            if (secretLength > 255) {
                // periksa berapa kali kita perlu indeks imageData
                // untuk menyimpan panjang rahasia kami
                var division = secretLength / 255;
                // integer number
                if (division % 1 === 0) {
                    for (var k = 0; k < division; k++) {
                        clampedArray.data[k] = 255;
                        index++;
                    }
                }
                // float number
                else {

                    var firstPortion = division.toString().split(".")[0];
                    var secondPortion = division.toString().split(".")[1];

                    for (var k = 0; k < firstPortion; k++) {
                        clampedArray.data[k] = 255;
                        index++;
                    }

                    var numberLeft = Math.round((division - firstPortion) * 255);
                    console.info('numberLeft : ' + numberLeft)
                    clampedArray.data[k] = numberLeft;
                    index++;
                }

            } else {
                clampedArray.data[0] = secretLength;
                index++;
            }
            console.log('Max C : ' + clampedArray.data[0])

        }

        var asciiCode = secret[i];
        // gunakan masking, untuk menghapus bit, dan ambil bit yang kita inginkan saja
        // Ambil hanya 2 bit pertama, mis .: 0111 0011 => 0000 0011
        var first2bit = (asciiCode & 0x03); // 0x03 = 3
        // Ambil hanya 4 bit pertama (2bit di akhir), mis .: 0111 0011 => 0000 0000
        var first4bitMiddle = (asciiCode & 0x0C) >> 2; // 0x0C = 12, bergeser ke kanan 2 bit atau bagi 2 ^ 2, karena kita ingin mengambil 2 bit pertama di akhir
        // Ambil hanya 6 bit pertama (2bit di akhir), mis .: 0111 0011 => 0011 0000
        var first6bitMiddle = (asciiCode & 0x30) >> 4; // 0x30 = 48, bergeser ke kanan 4 bit atau bagi 2 ^ 4, karena kami ingin mengambil 2 bit pertama di akhir
        // Ambil hanya 8 bit pertama (2bit di akhir), mis .: 0111 0011 => 0100 0000
        var first8bitMiddle = (asciiCode & 0xC0) >> 6; // 0xC0 = 192, bergeser ke kanan 6 bit atau bagi 2 ^ 6, karena kita ingin mengambil 2 bit pertama di akhir
        // console.log(i + ' : ' + first2bit);
        // console.log(i + ' : ' + first4bitMiddle);
        // console.log(i + ' : ' + first6bitMiddle);
        // console.log(i + ' : ' + first8bitMiddle);
        // start replacing our secret's bit on LSB
        replaceByte(first2bit);
        replaceByte(first4bitMiddle);
        replaceByte(first6bitMiddle);
        replaceByte(first8bitMiddle);
    }
}

function replaceByte(bits) {
    // clear the first two bit(LSB) using &
    // and replacing with secret's bit
    clampedArray.data[index] = (clampedArray.data[index] & 0xFC) | bits;
    index++;
}

var saveByteArray = (function() {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function(data, name) {
        var blob = new Blob(data, {
                type: "octet/stream"
            }),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());

function decodeUtf8(arrayBuffer) {
    var result = "";
    var i = 0;
    var c = 0;
    var c1 = 0;
    var c2 = 0;

    var data = new Uint8Array(arrayBuffer);

    // If we have a BOM skip it
    if (data.length >= 3 && data[0] === 0xef && data[1] === 0xBB && data[2] === 0xBF) {
        i = 3;
    }

    while (i < data.length) {
        c = data[i];

        if (c < 128) {
            result += String.fromCharCode(c);
            i++;
        } else if (c > 191 && c < 224) {
            if (i + 1 >= data.length) {
                throw "UTF-8 Decode failed. Two byte character was truncated.";
            }
            c2 = data[i + 1];
            result += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
        } else {
            if (i + 2 >= data.length) {
                throw "UTF-8 Decode failed. Multi byte character was truncated.";
            }
            c2 = data[i + 1];
            c3 = data[i + 2];
            result += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }
    }
    return result;
}