import dbClient from '../utils/dbClient.js'

/**
 * Create a new Cohort in the database
 * @returns {Cohort}
 */
export async function createCohort({ name, startDate, endDate }) {
  startDate = new Date(startDate)
  endDate = new Date(endDate)
  const createdCohort = await dbClient.cohort.create({
    data: {
      name,
      startDate,
      endDate,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  return new Cohort(createdCohort.id)
}

export async function getAllCohorts() {
  try {
    const cohorts = await dbClient.cohort.findMany({
      include: {
        users: { select: { id: true, role: true } }
      }
    })
    return cohorts
  } catch (error) {
    console.error('Error getting cohorts:', error)
    throw error
  }
}

export class Cohort {
  constructor(id = null) {
    this.id = id
  }

  toJSON() {
    return {
      cohort: {
        id: this.id
      }
    }
  }
}
