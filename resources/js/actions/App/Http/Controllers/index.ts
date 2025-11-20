import AdminSetupController from './AdminSetupController'
import ApplicationController from './ApplicationController'
import Student from './Student'
import StudentDashboardController from './StudentDashboardController'
import StudentStatusController from './StudentStatusController'
import CashierDashboardController from './CashierDashboardController'
import PaymentRecordsController from './PaymentRecordsController'
import DashboardController from './DashboardController'
import DormitoryController from './DormitoryController'
import AssignManagerController from './AssignManagerController'
import RoomController from './RoomController'
import StudentController from './StudentController'
import BookingController from './BookingController'
import CleaningScheduleController from './CleaningScheduleController'
import AdminUsersController from './AdminUsersController'
import Settings from './Settings'
import ArchiveController from './ArchiveController'
import BackupController from './BackupController'
import Auth from './Auth'
const Controllers = {
    AdminSetupController: Object.assign(AdminSetupController, AdminSetupController),
ApplicationController: Object.assign(ApplicationController, ApplicationController),
Student: Object.assign(Student, Student),
StudentDashboardController: Object.assign(StudentDashboardController, StudentDashboardController),
StudentStatusController: Object.assign(StudentStatusController, StudentStatusController),
CashierDashboardController: Object.assign(CashierDashboardController, CashierDashboardController),
PaymentRecordsController: Object.assign(PaymentRecordsController, PaymentRecordsController),
DashboardController: Object.assign(DashboardController, DashboardController),
DormitoryController: Object.assign(DormitoryController, DormitoryController),
AssignManagerController: Object.assign(AssignManagerController, AssignManagerController),
RoomController: Object.assign(RoomController, RoomController),
StudentController: Object.assign(StudentController, StudentController),
BookingController: Object.assign(BookingController, BookingController),
CleaningScheduleController: Object.assign(CleaningScheduleController, CleaningScheduleController),
AdminUsersController: Object.assign(AdminUsersController, AdminUsersController),
Settings: Object.assign(Settings, Settings),
ArchiveController: Object.assign(ArchiveController, ArchiveController),
BackupController: Object.assign(BackupController, BackupController),
Auth: Object.assign(Auth, Auth),
}

export default Controllers