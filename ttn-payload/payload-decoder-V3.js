function decodeUplink(input) {
    var i = 0;
    var decoded = {};
    var aWeighting = [ -39.4, -26.2, -16.1, -8.6, -3.2, 0.0, 1.2, 1.0, -1.1 ];
    var cWeighting = [  -3.0,  -0.8,  -0.2,  0.0,  0.0, 0.0, 0.2, 0.3, -3.0 ];
    
    function getVal12(){
       var val = 0;
       if(i % 2 === 0) {
          val  = input.bytes[i>>1] << 4;
          val |= (input.bytes[(i>>1) +1] & 0xf0) >> 4;
       }else{
          val  = (input.bytes[i>>1]  & 0x0f) << 8;
          val |= (input.bytes[(i>>1) +1]);
       }
       if(val & 0x800){
          val |= 0xfffff000;
       }
       i += 3;
       return val / 10.0;
    }
    
    var hexChar = ["0", "1", "2", "3", "4", "5", "6", "7","8", "9", "A", "B", "C", "D", "E", "F"];
    function getList12(len){
       var list = [];
       for( j=0; j<len; j++){
          list[j] = getVal12();
       }
       return list;
    }
    
    function byteToHex(b) {
       return hexChar[(b >> 4) & 0x0f] + hexChar[b & 0x0f];
    }
 
    function hexToInt(hex) {
       var num=hex;
       if (num>0x7F) {
          num=num-0x100;
       }
       return num;
    }
 
    switch(input.fPort) {
        // old soundkit payload format (message length is 51 bytes) 
        case 20:
          {
            decoded.la = {};
            decoded.la.spectrum = getList12(9);
            decoded.la.peak = getVal12();
            decoded.la.avg = getVal12();
      
            decoded.lc = {};
            decoded.lc.spectrum = getList12(9);
            decoded.lc.peak = getVal12();
            decoded.lc.avg = getVal12();
      
            decoded.lz = {};    
            decoded.lz.spectrum = getList12(9);
            decoded.lz.peak = getVal12();
            decoded.lz.avg = getVal12();
            
            return{ 
               data: decoded
            };
          }
            
        // also old soundkit payload format (message length is 27 bytes) 
       case 21:
        {
            var len = aWeighting.length;

            decoded.la = {};
            decoded.la.min = getVal12();
            decoded.la.max = getVal12();
            decoded.la.avg = getVal12();
    
            decoded.lc = {};
            decoded.lc.min = getVal12();
            decoded.lc.max = getVal12();
            decoded.lc.avg = getVal12();
        
            decoded.lz = {};    
            decoded.lz.min = getVal12();
            decoded.lz.max = getVal12();
            decoded.lz.avg = getVal12();
        
            decoded.lz.spectrum = getList12(len);

            decoded.la.spectrum = [];
            for( i=0; i<len; i++) 
            decoded.la.spectrum[i] = decoded.lz.spectrum[i] + aWeighting[i];

            decoded.lc.spectrum = [];
            for( i=0; i<len; i++) 
            decoded.lc.spectrum[i] = decoded.lz.spectrum[i] + cWeighting[i];
            return{ 
                data: decoded
                };
        }
            
        // new compressed payload format soundkit (message length is 18 bytes)
        case 22:
        {
            var max = bytes[i++];
            var c = max / 255.0;

            decoded.la = {};
            decoded.lc = {};
            decoded.lz = {};    
    
            // get min, max and avg for LA, LC and LZ
            decoded.la.min = c * input.bytes[i++];
            decoded.la.max = c * input.bytes[i++];
            decoded.la.avg = c * input.bytes[i++];    
            decoded.lc.min = c * input.bytes[i++];
            decoded.lc.max = c * input.bytes[i++];
            decoded.lc.avg = c * input.bytes[i++];    
            decoded.lz.min = c * input.bytes[i++];
            decoded.lz.max = c * input.bytes[i++];
            decoded.lz.avg = c * input.bytes[i++];
  
            // get LZ spectrum
            decoded.lz.spectrum = [];
            for( j=0; j<len; j++) 
                decoded.lz.spectrum[j] = c * input.bytes[i++];
   
            // convert LZ spectrum to LA
            decoded.la.spectrum = [];
            for( j=0; j<len; j++) 
                decoded.la.spectrum[j] = decoded.lz.spectrum[j] + aWeighting[j];

            // convert LZ spectrum to LC
            decoded.lc.spectrum = [];
            for( j=0; j<len; j++) 
                decoded.lc.spectrum[j] = decoded.lz.spectrum[j] + cWeighting[j];    
                
            return{ 
                data: decoded
                };    
                
        } 
       case 1:
        {
             var mac1="";
             for (i = 0; i < 6; i++){ 
                mac1 += byteToHex(input.bytes[i]);
                if (i<5){
                   mac1+=':';
                }
             }
             var rssi1=hexToInt(input.bytes[6]);
             
             var mac2="";
             for (i = 0; i < 6; i++){ 
                mac2 += byteToHex(input.bytes[i+7]);
                if (i<5){
                   mac2+=':';
                }
             }
             var rssi2=hexToInt(input.bytes[13]);
             
             return{
                macaddress:{
                   mac_1 : mac1,
                   rssi_1: rssi1,
                   mac_2 : mac2,
                   rssi_2: rssi2,
                }
             };
        }       
       default:
          return {
             data: input.bytes
            };
    }
}
// ------------------------------------------------------------------------
// EXAMPLE DATA SOUNKIT PORT 22 
//    "frm_payload": "NJ3irbX607n/2sq+pJuViIeNfw==",
//    "decoded_payload": {
//      "la": {
//        "avg": 35.27843137254902,
//        "max": 46.08627450980392,
//        "min": 32.015686274509804,
//        "spectrum": [
//          1.7921568627451023,
//          12.545098039215684,
//          17.34313725490196,
//          23.007843137254902,
//          27.184313725490195,
//          27.733333333333334,
//          28.72941176470588,
//          29.75294117647059,
//          24.798039215686273
//        ]
//      },
//      "lc": {
//        "avg": 43.02745098039215,
//        "max": 50.98039215686274,
//        "min": 36.909803921568624,
//        "spectrum": [
//          38.1921568627451,
//          37.94509803921569,
//          33.24313725490196,
//          31.6078431372549,
//          30.384313725490195,
//          27.733333333333334,
//          27.72941176470588,
//          29.05294117647059,
//          22.898039215686275
//        ]
//      },
//      "lz": {
//        "avg": 44.45490196078431,
//        "max": 52,
//        "min": 37.72549019607843,
//        "spectrum": [
//          41.1921568627451,
//          38.745098039215684,
//          33.44313725490196,
//          31.6078431372549,
//          30.384313725490195,
//          27.733333333333334,
//          27.52941176470588,
//          28.75294117647059,
//          25.898039215686275
//        ]
//      }
//    }
