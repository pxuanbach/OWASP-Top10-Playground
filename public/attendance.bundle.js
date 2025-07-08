// AttendanceList component (từ AttendanceList.js)
const sampleData = [
  { id: 1, name: 'Nguyen Van A', date: '2025-07-08', checkIn: '08:00', checkOut: '17:00', status: 'Đúng giờ' },
  { id: 2, name: 'Tran Thi B', date: '2025-07-08', checkIn: '08:15', checkOut: '17:05', status: 'Đi trễ' },
  { id: 3, name: 'Le Van C', date: '2025-07-08', checkIn: '07:55', checkOut: '17:00', status: 'Đúng giờ' },
  { id: 4, name: 'Pham Thi D', date: '2025-07-08', checkIn: '08:30', checkOut: '17:20', status: 'Đi trễ' },
];

function AttendanceList() {
  const [search, setSearch] = React.useState('');
  const filteredData = sampleData.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    React.createElement('div', { style: { maxWidth: 800, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' } },
      React.createElement('h2', null, 'Danh sách chấm công'),
      React.createElement('input', {
        type: 'text',
        placeholder: 'Tìm kiếm theo tên nhân viên...',
        value: search,
        onChange: e => setSearch(e.target.value),
        style: { width: '100%', padding: 8, marginBottom: 16, borderRadius: 4, border: '1px solid #ccc' }
      }),
      React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse' } },
        React.createElement('thead', null,
          React.createElement('tr', { style: { background: '#f5f5f5' } },
            React.createElement('th', { style: { border: '1px solid #ddd', padding: 8 } }, 'STT'),
            React.createElement('th', { style: { border: '1px solid #ddd', padding: 8 } }, 'Tên nhân viên'),
            React.createElement('th', { style: { border: '1px solid #ddd', padding: 8 } }, 'Ngày'),
            React.createElement('th', { style: { border: '1px solid #ddd', padding: 8 } }, 'Giờ vào'),
            React.createElement('th', { style: { border: '1px solid #ddd', padding: 8 } }, 'Giờ ra'),
            React.createElement('th', { style: { border: '1px solid #ddd', padding: 8 } }, 'Trạng thái')
          )
        ),
        React.createElement('tbody', null,
          filteredData.length === 0
            ? React.createElement('tr', null,
                React.createElement('td', { colSpan: 6, style: { textAlign: 'center', padding: 16 } }, 'Không có dữ liệu')
              )
            : filteredData.map((item, idx) => (
                React.createElement('tr', { key: item.id },
                  React.createElement('td', { style: { border: '1px solid #ddd', padding: 8 } }, idx + 1),
                  React.createElement('td', { style: { border: '1px solid #ddd', padding: 8 } }, item.name),
                  React.createElement('td', { style: { border: '1px solid #ddd', padding: 8 } }, item.date),
                  React.createElement('td', { style: { border: '1px solid #ddd', padding: 8 } }, item.checkIn),
                  React.createElement('td', { style: { border: '1px solid #ddd', padding: 8 } }, item.checkOut),
                  React.createElement('td', { style: { border: '1px solid #ddd', padding: 8 } }, item.status)
                )
              ))
        )
      )
    )
  );
}

// Render AttendanceList vào #root
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(AttendanceList));
