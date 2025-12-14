// 인증 관련 유틸리티 함수

import { User } from '../types';

const STORAGE_KEY = 'uni_planner_users';
const CURRENT_USER_KEY = 'uni_planner_current_user';

/**
 * 로컬 스토리지에서 모든 사용자 가져오기
 */
export function getUsers(): User[] {
  const usersJson = localStorage.getItem(STORAGE_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
}

/**
 * 사용자 저장
 */
export function saveUser(user: User): void {
  const users = getUsers();
  // 중복 체크 (아이디로)
  const existingUser = users.find(u => u.username === user.username);
  if (existingUser) {
    throw new Error('이미 존재하는 아이디입니다.');
  }
  
  users.push(user);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

/**
 * 로그인 (아이디와 비밀번호로 사용자 찾기)
 */
export function login(username: string, password: string): User | null {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    // 현재 사용자 저장
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  }
  
  return null;
}

/**
 * 현재 로그인된 사용자 가져오기
 */
export function getCurrentUser(): User | null {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
}

/**
 * 로그아웃
 */
export function logout(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

/**
 * 현재 사용자 업데이트
 */
export function updateCurrentUser(user: User): void {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  
  // 전체 사용자 목록도 업데이트
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index !== -1) {
    users[index] = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }
}




