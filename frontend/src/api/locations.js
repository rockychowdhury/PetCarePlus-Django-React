import api from './client'

export const locationsApi = {
  getDivisions: async () => {
    const res = await api.get('/locations/divisions/')
    return res.data
  },
  getDistricts: async (divisionId) => {
    if (!divisionId) return []
    const res = await api.get(`/locations/districts/?division=${divisionId}`)
    return res.data
  },
  getUpazilas: async (districtId) => {
    if (!districtId) return []
    const res = await api.get(`/locations/upazilas/?district=${districtId}`)
    return res.data
  },
  getUnions: async (upazilaId) => {
    if (!upazilaId) return []
    const res = await api.get(`/locations/unions/?upazila=${upazilaId}`)
    return res.data
  }
}
