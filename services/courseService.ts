// services/courseService.ts
import {
  collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, orderBy
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
    // 실제로는 학부나 전공으로 필터링
    const q = query(this.lecturesRef, where("dept", "==", dept));
    // 또는 where("major", "!=", "교양") 등의 조건 사용 가능
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as LectureData);
  }

  // 교양 강의 가져오기
  async getGeneralLectures(): Promise<LectureData[]> {
    // 데이터 구조에 따라 "major"가 "교양"이거나 "type"이 "교양"인 것 조회
    const q = query(this.lecturesRef, where("major", "==", "교양"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as LectureData);
  }

  // 모든 강의 검색 (검색어 기능용)
  async searchLectures(keyword: string): Promise<LectureData[]> {
    // Firestore는 full-text search가 제한적이므로, 
    // 실제 앱에서는 모든 데이터를 가져와서 클라이언트 필터링하거나 Algolia 등을 사용합니다.
    // 여기서는 간단히 구현합니다.
    const snapshot = await getDocs(this.lecturesRef);
    const all = snapshot.docs.map(doc => doc.data() as LectureData);
    return all.filter(l => l.name.includes(keyword) || l.professor.includes(keyword));
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

  // --- Semester 관련 ---

  async getUserSemesters(userId: string): Promise<Semester[]> {
    const q = query(
      this.semestersRef,
      where("userId", "==", userId),
      orderBy("name") // 이름순 정렬
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Semester));
  }

  async createSemester(userId: string, name: string): Promise<string> {
    // 중복 체크
    const q = query(
      this.semestersRef,
      where("userId", "==", userId),
      where("name", "==", name)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      throw new Error("이미 존재하는 학기입니다.");
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