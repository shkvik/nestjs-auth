import { Inject, Injectable } from "@nestjs/common";
import { DiscoveryService } from "@nestjs/core";
import { IdentityProvider } from "./identity.abstract";
import { IdentityType } from "src/db/entities";

@Injectable()
export class IdentityService {
  @Inject()
  private readonly discoveryService: DiscoveryService;

  private readonly providers = new Map<IdentityType, IdentityProvider>();

  public async onModuleInit(): Promise<void> {
    const wrappers = this.discoveryService.getProviders();
    const providers = wrappers
      .filter((wrapper) => wrapper.instance instanceof IdentityProvider)
      .map((wrapper) => wrapper.instance) as IdentityProvider[];

    for (const provider of providers) {
      this.providers.set(provider.type, provider);
    }
  }

  public getProvider(type: IdentityType): IdentityProvider {
    return this.providers.get(type);
  }
}