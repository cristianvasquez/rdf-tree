function getRelatedIds (dataset, term, uriToIds) {

  const toIds = (term) => uriToIds.has(term) ? [...uriToIds.get(term)] : []

  const incoming = Array.from(new Set(
    [...dataset.match(null, null, term)].
      map(x => x.subject).
      flatMap(toIds),
  ))

  const same = toIds(term)

  const outgoing = Array.from(new Set(
    [...dataset.match(term, null, null)].
      map(x => x.object).
      flatMap(toIds),
  ))

  return {
    incoming,
    same,
    outgoing,
  }
}

export { getRelatedIds }
