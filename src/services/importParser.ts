import type { TaDoneItem } from '@/store'

export type ImportMode = 'keep' | 'overwrite'

export type ParseResult = {
  items: TaDoneItem[]
  errors: ParseError[]
  summary: {
    totalLines: number
    parsedItems: number
    skippedLines: number
  }
}

export type ParseError = {
  line: number
  content: string
  reason: string
}

/**
 * 특정 형식의 텍스트를 파싱하여 TaDoneItem 배열로 변환
 * 형식:
 * YYYY-MM-DD
 * HH 제목
 * HH 제목
 *
 * 예시:
 * 2026-05-19
 * 07 기상
 * 08 아침
 * 09 출근
 */
export function parseTextDataFormat(text: string): ParseResult {
  const lines = text.split('\n')
  const items: TaDoneItem[] = []
  const errors: ParseError[] = []
  let currentDate = ''
  let skippedCount = 0

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/ // YYYY-MM-DD
  const timeRegex = /^(\d{1,2})(?::\d{2})?\s*(.*)$/ // HH 또는 HH:MM (제목은 선택사항)

  lines.forEach((line, idx) => {
    const lineNum = idx + 1
    const trimmed = line.trim()

    // 빈 줄 무시
    if (!trimmed) {
      skippedCount++
      return
    }

    // 날짜 라인 감지
    if (dateRegex.test(trimmed)) {
      const [year, month, day] = trimmed.split('-') as [string, string, string]
      currentDate = trimmed
      // 날짜 유효성 검증
      if (!isValidDate(year, month, day)) {
        errors.push({
          line: lineNum,
          content: trimmed,
          reason: '유효하지 않은 날짜 형식',
        })
        currentDate = ''
      }
      return
    }

    // 시간+제목 파싱
    const timeMatch = trimmed.match(timeRegex)
    if (timeMatch && timeMatch[1] !== undefined) {
      if (!currentDate) {
        errors.push({
          line: lineNum,
          content: trimmed,
          reason: '날짜 정보가 없습니다. 먼저 YYYY-MM-DD 형식의 날짜를 입력하세요.',
        })
        return
      }

      const hourStr = timeMatch[1]
      const title = (timeMatch[2] ?? '').trim()
      const hour = parseInt(hourStr, 10)

      // 시간 유효성 검증
      if (hour < 0 || hour > 23) {
        errors.push({
          line: lineNum,
          content: trimmed,
          reason: `시간은 00-23 범위여야 합니다. (입력값: ${hour})`,
        })
        return
      }

      // 제목이 비어있으면 스킵 (에러 아님)
      if (!title) {
        skippedCount++
        return
      }

      const [year, month, day] = currentDate.split('-') as [string, string, string]
      items.push({
        datetime: {
          year,
          month,
          day,
          hour: hourStr.padStart(2, '0'),
        },
        title: title.trim(),
        updatedAt: Date.now(),
      })
      return
    }

    // 파싱 불가능한 라인
    errors.push({
      line: lineNum,
      content: trimmed,
      reason: '형식에 맞지 않습니다. "HH 제목" 또는 "HH:MM 제목" 형식이어야 합니다.',
    })
  })

  return {
    items,
    errors,
    summary: {
      totalLines: lines.length,
      parsedItems: items.length,
      skippedLines: skippedCount,
    },
  }
}

function isValidDate(year: string, month: string, day: string): boolean {
  const date = new Date(`${year}-${month}-${day}T00:00:00Z`)
  if (isNaN(date.getTime())) return false

  // Date 객체가 자동으로 날짜를 조정하므로 (예: 2월 30일 → 3월 2일)
  // 파싱한 날짜와 입력값이 동일한지 확인
  const parts = date.toISOString().split('T')[0]?.split('-') ?? []
  const [parsedYear, parsedMonth, parsedDay] = parts as [string, string, string]
  return parsedYear === year && parsedMonth === month && parsedDay === day
}

export function exportTextDataFormat(items: TaDoneItem[]): string {
  if (items.length === 0) return ''

  // 날짜별로 그룹화
  const grouped = new Map<string, TaDoneItem[]>()
  items.forEach((item) => {
    const dateKey = `${item.datetime.year}-${item.datetime.month}-${item.datetime.day}`
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, [])
    }
    grouped.get(dateKey)!.push(item)
  })

  // 날짜 순서대로 정렬
  const sortedDates = Array.from(grouped.keys()).sort()

  // 텍스트 생성
  const lines: string[] = []
  sortedDates.forEach((date) => {
    lines.push(date)
    const itemsForDate = grouped.get(date)!
    // 시간 순서대로 정렬
    itemsForDate.sort((a, b) => a.datetime.hour.localeCompare(b.datetime.hour))
    itemsForDate.forEach((item) => {
      lines.push(`${item.datetime.hour} ${item.title}`)
    })
    lines.push('')
  })

  return lines.join('\n').trim()
}
