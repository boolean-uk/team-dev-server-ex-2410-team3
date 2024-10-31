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

  return createdCohort
}

export async function getCohortById(cohortId) {
  try {
    const cohort = await dbClient.cohort.findUnique({
      where: { id: cohortId },
      include: {
        users: {
          select: {
            id: true,
            role: true,
            email: true,
            specialism: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                bio: true,
                githubUsername: true
              }
            }
          }
        }
      }
    })
    return cohort
  } catch (error) {
    console.error('Error getting cohort: ', error)
    return null
  }
}

export async function getAllCohorts() {
  try {
    const cohorts = await dbClient.cohort.findMany({
      include: {
        users: {
          select: {
            id: true,
            role: true,
            email: true,
            specialism: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                bio: true,
                githubUsername: true
              }
            }
          }
        }
      }
    })
    return cohorts
  } catch (error) {
    console.error('Error getting cohorts:', error)
    return null
  }
}

export async function addUserToCohort(cohortId, userId) {
  if (!cohortId || !userId) {
    return null
  }

  try {
    // Adding user to cohort
    const cohort = await dbClient.cohort.update({
      where: { id: cohortId },
      data: {
        users: {
          connect: { id: userId }
        }
      }
    })

    // Adding cohort to user
    const user = await dbClient.user.update({
      where: { id: userId },
      data: {
        cohorts: {
          connect: { id: cohortId }
        }
      },
      select: {
        id: true,
        role: true,
        email: true,
        specialism: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            bio: true,
            githubUsername: true
          }
        }
      }
    })

    return { cohort, user }
  } catch (error) {
    console.error('Error adding user to cohort:', error)
    throw error
  }
}

export async function deleteCohort(cohortId) {
  try {
    const cohort = await dbClient.cohort.delete({
      where: { id: cohortId },
      include: {
        users: {
          select: {
            id: true,
            role: true,
            email: true,
            specialism: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                bio: true,
                githubUsername: true
              }
            }
          }
        }
      }
    })
    return cohort
  } catch (error) {
    console.error('Error deleting cohort:', error)
    return null
  }
}

export async function updateCohort(cohortId, { name, startDate, endDate }) {
  startDate = new Date(startDate)
  endDate = new Date(endDate)
  try {
    const cohort = await dbClient.cohort.update({
      where: { id: cohortId },
      data: {
        name,
        startDate,
        endDate,
        updatedAt: new Date()
      },
      include: {
        users: {
          select: {
            id: true,
            role: true,
            email: true,
            specialism: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                bio: true,
                githubUsername: true
              }
            }
          }
        }
      }
    })
    return cohort
  } catch (error) {
    console.error('Error updating cohort:', error)
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
