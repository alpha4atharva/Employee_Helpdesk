import { Injectable } from '@nestjs/common';

@Injectable()
export class SlaService {

  // SLA calculate based on priority
  calculateSla(priority: string) {

    if(priority === "LOW"){
      return 24; // hours
    }

    if(priority === "MEDIUM"){
      return 12;
    }

    if(priority === "HIGH"){
      return 4;
    }

    if(priority === "CRITICAL"){
      return 1;
    }

  }

}