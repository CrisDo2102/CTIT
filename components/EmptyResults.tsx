import type { ReactNode } from "react";

export type Suggestion = { label: string; count?: number; run: () => void };

// Trạng thái "không có kết quả" có lối thoát: gợi ý bỏ từng bộ lọc kèm số kết quả sẽ có, thay vì chỉ bảo "thử xoá bộ lọc".
export function EmptyResults({ message, suggestions, onReset, icon }: { message: ReactNode; suggestions: Suggestion[]; onReset: () => void; icon?: ReactNode }) {
  const useful = suggestions.filter((item) => item.count === undefined || item.count > 0).sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
  return (
    <div className="empty-state">
      <p className="empty-msg">{icon} {message}</p>
      {useful.length > 0 ? (
        <>
          <p className="empty-hint">Thử nới điều kiện:</p>
          <ul className="empty-suggest">
            {useful.map((item) => (
              <li key={item.label}>
                <button type="button" onClick={item.run}>
                  Bỏ <b>{item.label}</b>
                  {item.count !== undefined ? <em>{item.count} kết quả</em> : null}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <button type="button" className="btn ghost empty-reset" onClick={onReset}>Xóa tất cả bộ lọc</button>
    </div>
  );
}
