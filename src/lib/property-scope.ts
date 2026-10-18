/**
 * How a query is narrowed to the active property.
 *
 * Every table that carries `property_id` makes it nullable, because work done
 * before a host created a property is stored against null. So "the active
 * property" is two different filters depending on which one it is, and
 * getting that wrong is silent: the query still runs, still returns rows,
 * and quietly returns the wrong ones.
 *
 * That is not hypothetical. The full Guest Journey Playbook count in
 * journey-state was written as `.eq('user_id', …)` with no property filter at
 * all, on the strength of a comment claiming the playbooks table had no
 * property_id column. It does. One property's Playbook counted for every
 * property the host owned, and nothing failed — it just answered wrongly.
 *
 * This exists so the convention has a name and a test, rather than being
 * retyped at each call site where it can be forgotten once.
 */

/** The slice of a query builder this needs. Keeps it testable with a fake. */
export type PropertyScopable<T> = {
  eq(column: string, value: string): T
  is(column: string, value: null): T
}

/**
 * Narrow a query to one property, or to the unassigned rows when there is
 * none. Returns the builder so it stays chainable.
 *
 * `Q` is passed straight through rather than constrained to
 * PropertyScopable<Q>: a Supabase filter builder refers to itself through
 * several layers of generics, and the self-referential constraint makes the
 * compiler give up ("Type instantiation is excessively deep"). Both of a
 * filter builder's methods return the same builder type, so Q in / Q out is
 * accurate; the cast below is the only place that has to be taken on trust,
 * and PropertyScopable documents exactly what is being assumed.
 */
export function scopeToProperty<Q>(query: Q, propertyId: string | null): Q {
  const q = query as PropertyScopable<Q>
  return propertyId ? q.eq('property_id', propertyId) : q.is('property_id', null)
}
