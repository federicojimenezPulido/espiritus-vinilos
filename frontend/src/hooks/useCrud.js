import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  addVinyl, updateVinyl, deleteVinyl,
  addRum,   updateRum,   deleteRum,
  addWhisky,updateWhisky,deleteWhisky,
} from '../services/api'

// Mapeo de operaciones por colección — como un dispatcher
const OPS = {
  vinyl:  { add: addVinyl,  update: updateVinyl,  remove: deleteVinyl  },
  rum:    { add: addRum,    update: updateRum,    remove: deleteRum    },
  whisky: { add: addWhisky, update: updateWhisky, remove: deleteWhisky },
}

// useMutation = el hook para operaciones que modifican datos (POST/PUT/DELETE)
// Análogo: como ejecutar un INSERT/UPDATE/DELETE y luego hacer COMMIT
// onSuccess invalida el cache de la colección → React Query re-fetcha automáticamente
export function useCrud(coll) {
  const qc = useQueryClient()
  const ops = OPS[coll]

  const invalidate = () => qc.invalidateQueries({ queryKey: [coll] })

  const add = useMutation({
    mutationFn: (data) => ops.add(data),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ index, data }) => ops.update(index, data),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (index) => ops.remove(index),
    onSuccess: invalidate,
  })

  return { add, update, remove }
}
