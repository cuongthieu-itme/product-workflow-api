import { Module } from '@nestjs/common';
import { IngredientService } from './ingredient.service';
import { IngredientController } from './ingredient.controller';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [IngredientController],
  providers: [IngredientService],
  exports: [IngredientService],
})
export class IngredientModule {}
