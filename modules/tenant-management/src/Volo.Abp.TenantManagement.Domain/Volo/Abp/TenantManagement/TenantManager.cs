﻿using System;
using System.Threading.Tasks;
using Volo.Abp.Caching;
using Volo.Abp.Domain.Services;
using Volo.Abp.MultiTenancy;

namespace Volo.Abp.TenantManagement;

public class TenantManager : DomainService, ITenantManager
{
    protected ITenantRepository TenantRepository { get; }
    protected IDistributedCache<TenantConfigurationCacheItem> Cache { get; }

    public TenantManager(ITenantRepository tenantRepository,
        IDistributedCache<TenantConfigurationCacheItem> cache)
    {
        TenantRepository = tenantRepository;
        Cache = cache;
    }

    public virtual async Task<Tenant> CreateAsync(string name)
    {
        Check.NotNull(name, nameof(name));

        await ValidateNameAsync(name);
        return new Tenant(GuidGenerator.Create(), name);
    }

    public virtual async Task ChangeNameAsync(Tenant tenant, string name)
    {
        Check.NotNull(tenant, nameof(tenant));
        Check.NotNull(name, nameof(name));

        await ValidateNameAsync(name, tenant.Id);
        await Cache.RemoveAsync(TenantConfigurationCacheItem.CalculateCacheKey(tenant.Name));
        tenant.SetName(name);
    }

    protected virtual async Task ValidateNameAsync(string name, Guid? expectedId = null)
    {
        var tenant = await TenantRepository.FindByNameAsync(name);
        if (tenant != null && tenant.Id != expectedId)
        {
            throw new BusinessException("Volo.Abp.TenantManagement:DuplicateTenantName").WithData("Name", name);
        }
    }
}
