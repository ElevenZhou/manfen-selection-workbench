# 派发与容量规则

## 配置表

每位维护人员至少维护以下字段：

```text
user_id, display_name, role, active,
skills[], markets[], product_forms[],
base_concurrency, claim_bonus_limit,
timezone, availability, priority_weight,
current_active_count, last_assigned_at
```

`claim_bonus_limit` 默认 2，最大值由管理员限制；它只给主动认领使用，自动分派不能消耗该额度。

## 全局容量公式

```text
base_capacity = Σ active_member.base_concurrency
claim_capacity = Σ active_member.claim_bonus_limit
global_hard_limit = base_capacity + claim_capacity
```

“进展中”包括 `claimed`、`processing`、`review`。`queued` 不占用容量，`completed`、`blocked`、`cancelled` 释放容量。任务必须在事务中变更，不能先读计数再裸写。

## 自动分派

1. 只选择 `active=true`、可用时间命中、技能/市场/产品形态匹配的人员。
2. 过滤 `current_active_count < base_concurrency` 的人员。
3. 按匹配度、剩余容量比例、`last_assigned_at`、优先级权重排序。
4. 事务锁定人员和任务，写入 `assignee_id`、`assignment_kind=auto`、租约和审计事件。
5. 没有合适人员时保留 `queued`，显示可认领原因，不偷偷扩大容量。

## 主动认领

- 只有 `queued` 且 `claimable=true` 的任务可认领。
- 认领者必须满足技能和账号状态要求。
- 认领时允许 `current_active_count < base_concurrency + claim_bonus_limit`，并且本人通过主动认领占用的数量不能超过 2。
- 成功后写 `assignment_kind=claim`；管理员回收或任务完成后额度释放。
- 并发认领使用数据库行锁/可序列化事务；失败必须返回“容量已被其他人占用”，客户端不能盲目重试。

## 例子

三名维护人员基础容量为 3、2、1，且每人额外认领 2 个：

```text
base_capacity = 6
claim_capacity = 6
global_hard_limit = 12
```

自动分派最多占用 6 个；另外最多 6 个只能由本人主动认领。若某人停用，立即从全局上限扣除其未占用额度，已运行任务进入交接/回收流程。

## 回收与公平

- 租约超时先进入 `stale`，保留原负责人和最后心跳。
- 回收器只重派未产生不可逆外部副作用的任务；已触发外部写入的任务进入人工复核。
- 以等待时间和可用容量做 aging，防止低优先级任务永久饥饿。
- 每次自动决策保存规则版本、候选人员、淘汰原因和最终选择。
