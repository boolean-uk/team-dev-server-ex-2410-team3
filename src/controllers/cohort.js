import * as Cohort from '../domain/cohort.js'
import User from '../domain/user.js'
import { sendDataResponse, sendMessageResponse } from '../utils/responses.js'

export const create = async (req, res) => {
  const { name, startDate, endDate } = req.body

  if (!name || !startDate || !endDate) {
    return sendMessageResponse(res, 400, 'Missing required information')
  }

  try {
    const createdCohort = await Cohort.createCohort({
      name,
      startDate,
      endDate
    })

    return sendDataResponse(res, 201, createdCohort)
  } catch (e) {
    return sendMessageResponse(res, 500, 'Unable to create cohort')
  }
}

export const getById = async (req, res) => {
  let { cohortId } = req.params
  cohortId = parseInt(cohortId)

  if (!cohortId) {
    return sendMessageResponse(res, 400, 'Missing cohortId as parameter')
  }

  const cohort = await Cohort.getCohortById(cohortId)

  if (cohort === null) {
    return sendMessageResponse(res, 404, 'Cohort not found')
  }

  return sendDataResponse(res, 200, { cohort })
}

export const getAll = async (req, res) => {
  try {
    const allCohorts = await Cohort.getAllCohorts()

    return sendDataResponse(res, 200, { cohorts: allCohorts })
  } catch (e) {
    return sendMessageResponse(
      res,
      500,
      'Internal server error when getting all cohorts.'
    )
  }
}

export const addUserToCohort = async (req, res) => {
  const { cohortId, userId } = req.body

  if (!cohortId || !userId) {
    return sendMessageResponse(
      res,
      400,
      'Missing cohortId or userId in request body.'
    )
  }

  const existingCohort = await Cohort.getCohortById(cohortId)
  if (existingCohort === null) {
    return sendMessageResponse(res, 404, 'Cohort not found')
  }

  const existingUser = await User.findById(userId)
  if (existingUser === null) {
    return sendMessageResponse(res, 404, 'User not found')
  }

  try {
    const updatedCohort = await Cohort.addUserToCohort(cohortId, userId)

    return sendDataResponse(res, 201, updatedCohort)
  } catch (e) {
    return sendMessageResponse(res, 500, 'Unable to add user to cohort')
  }
}

export const update = async (req, res) => {
  let { cohortId } = req.params
  cohortId = parseInt(cohortId)
  const { name, startDate, endDate } = req.body

  if (!cohortId) {
    return sendMessageResponse(res, 400, 'Missing cohortId as parameter')
  }

  if (!name && !startDate && !endDate) {
    return sendMessageResponse(
      res,
      400,
      'Missing required information in requets body.'
    )
  }

  const existingCohort = await Cohort.getCohortById(cohortId)
  if (existingCohort === null) {
    return sendMessageResponse(res, 404, 'Cohort not found')
  }

  try {
    const updatedCohort = await Cohort.updateCohort(cohortId, {
      name,
      startDate,
      endDate
    })

    return sendDataResponse(res, 201, updatedCohort)
  } catch (e) {
    return sendMessageResponse(
      res,
      500,
      'Internal server error; unable to update cohort'
    )
  }
}

export const deleteCohort = async (req, res) => {
  let { cohortId } = req.params
  cohortId = parseInt(cohortId)

  if (!cohortId) {
    return sendMessageResponse(res, 400, 'Missing cohortId as parameter')
  }

  const existingCohort = await Cohort.getCohortById(cohortId)
  if (existingCohort === null) {
    return sendMessageResponse(res, 404, 'Cohort not found')
  }

  try {
    const deletedCohort = await Cohort.deleteCohort(cohortId)

    return sendDataResponse(res, 201, deletedCohort)
  } catch (e) {
    return sendMessageResponse(
      res,
      500,
      'Internal server error; unable to delete cohort'
    )
  }
}
