import { Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { IdentityService } from "./identity.service";
import { PhoneModule } from "./phone";
import { EmailModule } from "./email";

@Module({
  imports: [DiscoveryModule, PhoneModule, EmailModule],
  providers: [IdentityService],
  exports: [IdentityService]
})
export class IdentityModule { }