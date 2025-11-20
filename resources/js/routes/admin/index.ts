import users from './users'
import students from './students'
const admin = {
    users: Object.assign(users, users),
students: Object.assign(students, students),
}

export default admin