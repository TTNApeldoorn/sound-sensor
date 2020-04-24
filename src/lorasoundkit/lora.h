/*--------------------------------------------------------------------
  This file is part of the TTN-Apeldoorn Sound Sensor.

  This code is free software:
  you can redistribute it and/or modify it under the terms of a Creative
  Commons Attribution-NonCommercial 4.0 International License
  (http://creativecommons.org/licenses/by-nc/4.0/) by
  TTN-Apeldoorn (https://www.thethingsnetwork.org/community/apeldoorn/) 

  The program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  --------------------------------------------------------------------*/

/*!
 * \file lora.h
 * \brief LoRa LMIC wrapper class for TTN-Apeldoorn Sound Sensor.
 * 
 * \author Marcel Meek
 * \date See revision table
 * \version see revision table
 * 
 * ## version
 * 
 * version | date       | who            | Comment
 * --------|------------|----------------|-------------------------------------
 * 0.1     | 22-4-2020  | Marcel Meek    | Initial release within community for
 *         |            |                | review and testing within dev-team
 * 0.2     | 24-4-2020  | Remko Welling  | Added headers, Sanitize code, add 
 *         |            |                | Doxygen compatible comments, add 
 *         |            |                | include guards
 *         |            |                |
 *         |            |                |
 *
 * # References
 *
 * -
 *
 * # Dependencies
 * 
 * 
 * # ToDo
 * \todo RW Add documentation on hardware connections
 * \todo RW remove credentials to credentials file
 */

#ifndef __LORA_H_
#define __LORA_H_

// define here your keys and LoRa RFM95 pinning

// specify here TTN keys 
/// \todo move to separate credentials file.
#define APPEUI "70B3D57ED002DDB2"
#define DEVEUI "0075BD2E52919D51"
#define APPKEY "4D3509EB008CB207D2E15CE4AA251704"

// define RFM 95 pins
/// \todo move to separate configuration file
#define NSS   16
#define RXTX  LMIC_UNUSED_PIN
#define RST   5
#define DIO1  26
#define DIO2  33
#define DIO3  32

class LoRa{
  public:
    
    LoRa();
    
    ~LoRa();
    
    /// \brief send data to LoRaWAN
    /// \param [in] port application port in LoRaWAN application (1 to 99)
    /// \param [in] buf pointer to character array that contains payload to be sent.
    /// \param [in] len Lenght of payload to be sent.
    void sendMsg( int port, uint8_t* buf, int len);
    
    /// \brief function to be called to allow LMIC OS to operated.
    /// Shall be called periodically to let LMIC operate.
    void loop();

  private:
    //void onEvent (ev_t ev);
};

#endif // __LORA_H_