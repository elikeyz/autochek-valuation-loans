import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './vehicle.entity';

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);

  constructor(@InjectRepository(Vehicle) private repo: Repository<Vehicle>) {}

  async create(data: Partial<Vehicle>) {
    const v = this.repo.create(data);
    return this.repo.save(v);
  }

    async findOne(id: string) {
    return this.repo.findOne({ 
      where: { id },
      relations: {
        valuation: true
      }
    });
  }

  async findAll() {
    return this.repo.find({
      relations: {
        valuation: true
      }
    });
  }

  async findByVin(vin: string) {
    return this.repo.findOne({ 
      where: { vin },
      relations: {
        valuation: true
      }
    });
  }
}
