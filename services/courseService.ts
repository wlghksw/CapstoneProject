import { 
  collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, orderBy, limit 
} from 'firebase/firestore';
import { db } from './firebase';
import { Course, LectureData, Semester } from '../types';

class CourseService {
  private lecturesRef = collection(db, 'lectures');
  private coursesRef = collection(db, 'courses');
  private semestersRef = collection(db, 'semesters');

  // --- Lecture (전체 강의 DB) 관련 ---
  
  // 전공 강의 가져오기
  async getMajorLectures(dept: string): Promise<LectureData[]> {
    // 주의: dept 값이 DB와 정확히 일치해야 합니다. (예: "컴퓨터공학부")
    const q = query(this.lecturesRef, where("dept", "==", dept)); 
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LectureData));
  }

  // [수정됨] 교양 강의 가져오기
  async getGeneralLectures(): Promise<LectureData[]> {
    // dept가 "교양대학"인 모든 강의를 가져옵니다.
    const q = query(this.lecturesRef, where("dept", "==", "교양대학"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LectureData));
  }
  
  // 검색 기능
  async searchLectures(keyword: string): Promise<LectureData[]> {
    const snapshot = await getDocs(this.lecturesRef);
    const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LectureData));
    // 클라이언트 사이드 필터링 (Firestore는 부분 검색을 지원하지 않음)
    return all.filter(l => 
      l.name.includes(keyword) || 
      l.professor.includes(keyword)
    );
  }

  // --- User Course (내 시간표) 관련 ---

  async getUserCourses(userId: string, semesterId: string): Promise<Course[]> {
    const q = query(
      this.coursesRef, 
      where("userId", "==", userId),
      where("semesterId", "==", semesterId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
  }

  async addCourseToSemester(courseData: Omit<Course, 'id'>): Promise<string> {
    const docRef = await addDoc(this.coursesRef, courseData);
    return docRef.id;
  }

  async deleteCourse(courseId: string): Promise<void> {
    await deleteDoc(doc(this.coursesRef, courseId));
  }

  async updateCourse(courseId: string, data: Partial<Course>): Promise<void> {
    await updateDoc(doc(this.coursesRef, courseId), data);
  }

  // --- Semester 관련 ---

  async getUserSemesters(userId: string): Promise<Semester[]> {
    const q = query(
      this.semestersRef, 
      where("userId", "==", userId),
      orderBy("name") 
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Semester));
  }

  async createSemester(userId: string, name: string): Promise<string> {
    const q = query(
      this.semestersRef, 
      where("userId", "==", userId),
      where("name", "==", name)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      // 이미 존재하면 해당 ID 반환
      return snapshot.docs[0].id;
    }

    const docRef = await addDoc(this.semestersRef, {
      userId,
      name,
      createdAt: new Date()
    });
    return docRef.id;
  }
}

export const courseService = new CourseService();


