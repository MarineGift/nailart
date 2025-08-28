// 전화번호 포맷팅 유틸리티

export function formatPhoneNumber(phone: string): string {
  if (!phone) return ''
  
  // 숫자만 추출
  const digits = phone.replace(/\D/g, '')
  
  // 10자리 미국 번호인 경우 (571)531-8278 형태로 포맷
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)})${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  
  // 11자리이고 1로 시작하는 경우 (미국 국가코드 포함)
  if (digits.length === 11 && digits.startsWith('1')) {
    const areaCode = digits.slice(1, 4)
    const exchange = digits.slice(4, 7)
    const number = digits.slice(7)
    return `(${areaCode})${exchange}-${number}`
  }
  
  // 다른 형태는 원본 반환
  return phone
}

export function parsePhoneNumber(formattedPhone: string): string {
  // 포맷된 번호에서 숫자만 추출하여 원본 형태로 변환
  return formattedPhone.replace(/\D/g, '')
}