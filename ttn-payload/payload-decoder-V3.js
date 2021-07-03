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
// EXAMPLE DATA: 22336E2AF22038B2C422338B2C41B21BB20F2722A528F22F2121DC
//               2232D92452222E92522252E92531AE1B71BA1E22281FE1FC1FD1D9

// Output:
// {
//     "la": {
//       "avg": 68.7,
//       "max": 87.8,
//       "min": 54.7,
//       "spectrum": [
//         4,
//         18.099999999999998,
//         36.6,
//         54,
//         64.5,
//         65.5,
//         57.1,
//         54,
//         46.5
//       ]
//     },
//     "lc": {
//       "avg": 70.8,
//       "max": 90.7,
//       "min": 54.4,
//       "spectrum": [
//         40.4,
//         43.5,
//         52.5,
//         62.6,
//         67.7,
//         65.5,
//         56.1,
//         53.3,
//         44.6
//       ]
//     },
//     "lz": {
//       "avg": 70.8,
//       "max": 90.7,
//       "min": 54.7,
//       "spectrum": [
//         43.4,
//         44.3,
//         52.7,
//         62.6,
//         67.7,
//         65.5,
//         55.9,
//         53,
//         47.6
//       ]
//     }
//   }