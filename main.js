/*
File berisi fungsi pada aplikasi, mulai dari viginere, enkrip, dekrip dan fungsi stegano
*/

///Fungsi membaca isi file txt
document.getElementById('uploadBtn').addEventListener('change', function () {
    var fr = new FileReader();
    fr.onload = function () {
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
    ///validasi kalau spasi
    ///buat fungsi pada saat mengambil nilai citra, convert to binner, ambil nilai terakhir kemudian replace nilai binner terakhir citra dengan masing2 binner pada viginere sesuai uturan
    ///get value 
    console.log("Result Viginere : " + secret);
    if (secret != '') {
        $('#btn-download').show();
    } else {
        $('#btn-download').hide();
    }
}

function globaldoCrypt(){
    var key = filterKey(document.getElementById("key").value);
    var textElem = document.getElementById("output");
    var input = crypt(document.getElementById('teks').value, key);
    var secret = document.getElementById('teks').value = textElem.innerHTML;

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

///viginere
function charToBiner(data){
    let outputStr = data.split('') // split in single chars
                      .map(c => c.charCodeAt(0) // get the charcode (10 base)
                                  .toString(2)) // transform it back to a string (2 base)
                      .join(' ') // make single string from array

    // console.log(outputStr);
    return outputStr;
}

function intToBiner(data){
    const arr = [];

    for (var i in data){
        const str = data[i];
        // const value = str.toString(2)
        const binary = toBinary(data[i], 8);
        arr.push(binary);
    }
    return arr;
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

function getCitra(value){
    // for(i = 0; i <= value.length; i++){
    //     // console.log('data i ke', [i], 'adalah', value[i]);
    //     let binerViginer = value[i].charCodeAt(0).toString(2);
    //     for(j=0; j<= binerViginer.length; j++){
    //         // console.log('data biner ke', [j], 'adalah', binerViginer[j].charCodeAt(0).toString(2) + "-");
    //         if(j == 6){
    //             console.log('data : '+value[i],'binernya adalah', binerViginer)
    //             console.log('lastBinner adalah',binerViginer[j]);
    //             // break;
    //         }
    //         // break;
    //     }
    // }
    console.log(value.length);
}

///Start Stegano

/*Deklarasi variabel dan Mengambil nilai pada HTML*/
var
    myFile = document.getElementById('uploadBtn'),
    canvas = document.getElementById('canvas'),
    secret = document.getElementById('secret'),
    coverAfter = document.getElementById('coverAfter'),
    tipe = document.getElementById('tipe-img').value,
    ctx = canvas.getContext('2d'),
    ctxSecret = secret.getContext('2d'),
    ctxCoverAfter = coverAfter.getContext('2d'),
    loadFile = document.getElementById('loadFile'),
    view,
    clampedArray,
    index = 0;


///membaca file
myFile.addEventListener('change', function (e) {
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

function toBinary(integer, withPaddingLength) {
    let str = integer.toString(2);
    return str.padStart(withPaddingLength, "0");
  }


function bin_to_dec(bstr) { 
    // console.log('bstr',bstr);
    var data = [];
    for (i in bstr){
        data.push(parseInt((bstr[i] + '').replace(/[^01]/gi, ''), 2));
    }
    // return parseInt((bstr + '')
    // .replace(/[^01]/gi, ''), 2);
    console.log(data);
    return data;
}



function noiseCitra(secret, citraAwal){
    // console.log('binercitraawa', citraAwal);
    const arrSecret = [];
    for(var i in secret){
        arrSecret.push(secret[i].charCodeAt(0).toString(2));
    }
    console.log(arrSecret.join(''));
    const allScret = arrSecret.join('');
    var arr = citraAwal.join('');
    // console.log('citra', arr);
  
    var k = 0;
    var secLength = allScret.length;
    // console.log('lengt secret', secLength);
    var secure = [];
    for(i = 0; i < arr.length; i++){
        if((i % 7) == 0){
            secure.push(allScret[k]);
        } else {
            secure.push(arr[i]);
        }
        k++;
    }
    const strSecure = secure.join('');
    const result = strSecure.match(/.{1,8}/g);

    console.log(strSecure);
    const hasil = bin_to_dec(result);
    console.log(result);
    return hasil;
}



///Fungsi HideData waktu di klik
hideData.addEventListener('click', function () {
    var
        cover = document.getElementById('cover'),
        file = cover.files[0],
        fr = new FileReader();
    fr.addEventListener("load", loadEvent);
    fr.addEventListener("loadend", loadEndEvent);

    function loadEvent(e) {
        console.info("Sedang di load, tunggu sampai selesai");
    }

    function getPixel(x, y, clampedArray){  
        var arr = Array();
        var i =((y*512)+x)*4;
        // console.log('panjang',clampedArray.data.length);

        console.log('clampedArray',clampedArray);
        arr[0]=clampedArray.data[i]; //warna merah
        arr[1]=clampedArray.data[i+1]; //warna hijau
        arr[2]=clampedArray.data[i+2]; //warna biru
        arr[3]=clampedArray.data[i+3] //transparensi/alpha
        // return arr;
        // console.log(arr)
        return arr;
    }

    function loadEndEvent(e) {
        console.log("Selesai");
        var img = new Image();
        img.src = e.target.result;

        console.log('secret viginere', globaldoCrypt());  
        console.log('secret to binner',charToBiner(globaldoCrypt()));
        // console.log('citra awal', getPixel(0,0));
                  
            img.onload = function () {
                if (tipe == 'Normal') {
                    alert('gras');
                    ctx.drawImage(img, 0, 0);
                    clampedArray = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    console.log('pixel RGBA',getPixel(0, 0, clampedArray));
                    console.log('biner pixel',intToBiner(getPixel(0, 0, clampedArray)))
                    console.log('new binner', toBinary(getPixel(0, 0, clampedArray), 8))
                    console.log('clamped',clampedArray.data);
                    console.log('citra noise', noiseCitra(globaldoCrypt(), intToBiner(getPixel(0,0,clampedArray))));
                    // getCitra(clampedArray.data);
                    console.log('mse', compare(noiseCitra(globaldoCrypt(), intToBiner(getPixel(0,0,clampedArray))), getPixel(0, 0, clampedArray)))
                    const mse =  compare(noiseCitra(globaldoCrypt(), intToBiner(getPixel(0,0,clampedArray))), getPixel(0, 0, clampedArray));
                    console.log('psnr', psnr(mse, 255));
                    // for(i in clampedArray.data){
                    //     console.log('clam ', clampedArray.data[i]);
                    // }
                    const data = clampedArray.data;
                    console.log('Image Normal',data);
                    readByte(view);
                    ctxSecret.putImageData(clampedArray, 0, 0);
                    console.log('View1 :', view);
                    // getCitra(clampedArray);
                } 
            if (tipe == 'GreyScale') {
                alert('grey');
                ctx.drawImage(img, 0, 0);
                clampedArray = ctx.getImageData(0, 0, canvas.height, canvas.width);
                console.log(clampedArray);
                const data = clampedArray.data;
                for (var i = 0; i < data.length; i += 4) {
                    var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    data[i] = avg; // red
                    data[i + 1] = avg; // green
                    data[i + 2] = avg; // blue
                }
                ctx.putImageData(imageData, 0, 0);
                console.log('data greyscale', data);
                readByte(view);
                ctxSecret.putImageData(clampedArray, 0, 0);
            }

        }
    }
    fr.readAsDataURL(file);
});

///Untuk meload gambar setelah di klik button hidenya
loadFile.addEventListener('change', function (e) {
    var file = e.target.files[0];
    var fr = new FileReader();

    fr.addEventListener("loadend", loadEndEvent);

    function loadEndEvent(e) {

        var img = new Image();
        img.src = e.target.result;
        // menunggu 3 detik untuk meload gambar
        // kemudian gambar di tampilkan pada class canvas
        img.onload = function () {
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
            console.info('Matriks Citra Awal : ', comparetoMatrix(view, 3)); ///citra awal
            console.info('Matriks Citra Akhir :', comparetoMatrix(newUint8Array, 3)); ///citra akhir
            console.info('MSE :=> ', compare(view, newUint8Array));
            console.info('PSNR :=> ', psnr(compare(view, newUint8Array), maxValue(view, newUint8Array)));
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

function maxValue(value1, value2) {
    cawal = Math.max.apply(null, value1);
    cakhir = Math.max.apply(null, value2);
    return Math.max(cawal, cakhir);
}

function comparetoMatrix(list, elementPerSubArray) {
    var matrix = [],
        i, k;

    for (i = 0, k = -1; i < list.length; i++) {
        if (i % elementPerSubArray === 0) {
            k++;
            matrix[k] = [];
        }
        matrix[k].push(list[i]);
    }
    return matrix;
}

function compare(image1, image2) {
    ///mse 
    var total = 0;
    console.log('image 1', image1);
    console.log('image 2', image2);

    var total1 = Math.pow((image1[0] - image2[0]), 2);
    var total2 = Math.pow((image1[1] - image2[1]), 2);
    var total3 = Math.pow((image1[2] - image2[2]), 2);
    var total4 = Math.pow((image1[3] - image2[3]), 2);

    console.log('1', total1);
    console.log('2', total2);
    console.log('3', total3);
    console.log('4', total4);

    total = (total1 + total2 + total3 + total4);

    // for(var i in image1){
    //     total+= Math.pow((image1[i] - image2[i]),2);
        
    //     // for (var j in image2){
    //     //     total += Math.pow((image1[i] - image2[j]),2);
    //     //     break;
    //     //     j++;
    //         console.log('step', image1[i] + '-' + image2[i] + '=' + total);
    //     // }
    // }

    // // for (var i = 0; i < image1.length; i++) {
    // //     for (var j = 0; j < image2.length; j++) {
    // //         total += Math.pow((image2[j] - image1[i]), 2);
    // //         console.log('jumlah'+image2[j]+'-'+image1[i]+'total' +total);
    // //         break;
    // //     }
    // // }
    var result = total / 8;
    return result;
}

function psnr(mse, max) {
    return 20 * (Math.log10(max / mse));z
}

function readByte(secret) {
    for (var i = 0, length = secret.length; i < length; i++) {

        if (i == 0) {
            // pada bit pertama, simpan panjang data rahasia
            // harus dikalikan 4, sebagai kode satu karakter yang berisi
            // 8bits, dengan demikian 8bits ini dibagi 2. Setiap 2 bit harus diganti
            // LSB (Paling sedikit signifikan) dari byte byte
            var secretLength = length * 4;
            console.log('Secret Length(' + length + 'x4) : ' + secretLength)
            // karena imageData kami adalah array yang diketik (Uint8ClampedArray)
            // itu hanya dapat menyimpan nilai tidak lebih dari 256 (8bit atau 1byte)
            if (secretLength > 255) {
                // periksa berapa kali kita perlu indeks imageData
                // untuk menyimpan panjang rahasia kami
                var division = secretLength / 255;
                console.log('division');
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
        // console.log('first2bit', first2bit);
        // Ambil hanya 4 bit pertama (2bit di akhir), mis .: 0111 0011 => 0000 0000
        var first4bitMiddle = (asciiCode & 0x0C) >> 2; // 0x0C = 12, bergeser ke kanan 2 bit atau bagi 2 ^ 2, karena kita ingin mengambil 2 bit pertama di akhir
        // Ambil hanya 6 bit pertama (2bit di akhir), mis .: 0111 0011 => 0011 0000
        var first6bitMiddle = (asciiCode & 0x30) >> 4; // 0x30 = 48, bergeser ke kanan 4 bit atau bagi 2 ^ 4, karena kami ingin mengambil 2 bit pertama di akhir
        // Ambil hanya 8 bit pertama (2bit di akhir), mis .: 0111 0011 => 0100 0000
        var first8bitMiddle = (asciiCode & 0xC0) >> 6; // 0xC0 = 192, bergeser ke kanan 6 bit atau bagi 2 ^ 6, karena kita ingin mengambil 2 bit pertama di akhir
        // console.log(i + ' : ' + first2bit);
        // console.log('data 4 bit',i + ' : ' + first4bitMiddle);
        // console.log('data 6 bit',i + ' : ' + first6bitMiddle);
        // console.log('data 8 bit',i + ' : ' + first8bitMiddle);
        // start replacing our secret's bit on LSB
        // replaceByte(first2bit);
        // replaceByte(first4bitMiddle);
        // replaceByte(first6bitMiddle);
        replaceByte(first8bitMiddle);
    }
}

function replaceByte(bits) {
    // clear the first two bit(LSB) using &
    // and replacing with secret's bit
    clampedArray.data[index] = (clampedArray.data[index] & 0xFC) | bits;
    index++;
}

var saveByteArray = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, name) {
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