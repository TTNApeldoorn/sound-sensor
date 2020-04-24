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
 * \file measurement.cpp
 * \author Marcel Meek
 * \date See revision table in header file
 * \version see revision table in header file
 * 
 * # ToDo
 * \todo RW Add documentation on hardware connections
 */
 
#include <Arduino.h>
#include "measurement.h"

//Measurement::Measurement( float* weighting) {
//  _weighting = weighting;
//  for(int i=0; i<OCTAVES; i++){
//    _weighting[i] = pow(10, _weighting[i] / 10.0);  // convert dB constants to level constatnts
//  }
//  reset();
//}

/// Changed initialisation of member variable _weighting and _count to initializer list.
/// \todo Verify operation.
Measurement::Measurement( float* weighting):
  _weighting(weighting),
  _count(0)
{
  for(int i=0; i<OCTAVES; i++){
    _weighting[i] = pow(10, _weighting[i] / 10.0);  // convert dB constants to level constants
  }
  reset();
}


void Measurement::reset(){
  peak = avg = 0.0;
  _count = 0;
  for( int i=0; i< OCTAVES; i++){
   spectrum[i] = 0.0; 
  }
}

void Measurement::update( float* energies ){
  float sum = 0.0;
  for (int i = 0; i < OCTAVES; i++){
    float v = energies[i] * _weighting[i];
    sum += v;
    spectrum[i] += decibel(v);
  }
  sum = decibel(sum);
  avg += sum;
  if( peak < sum){
    peak = sum;
  }
  _count++;
}

void Measurement::calculate(){
  avg /= _count;
  for( int i=0; i< OCTAVES; i++){
    spectrum[i] /= _count;
  }
}

float Measurement::decibel(float v){
  return 10.0 * log10(v); // log(10);     // for energy this should be 20.0 * log...  to be checked! 
}

void Measurement::print(){
  printf("count=%d peak=%.1f avg=%.1f =>", _count, peak, avg);
  for (int i = 0; i < OCTAVES; i++){
    printf(" %.1f", spectrum[i]);
  }
  printf("\n");
} 
