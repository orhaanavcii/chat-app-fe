// material-ui
import {
  Box,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  useTheme,
} from '@mui/material';
import PuffLoader from 'react-spinners/PuffLoader';
import { TablePagination, findSubElement } from './utils/TableUtils';

export function TableCustomPagination({
  columns,
  data,
  totalSize,
  onChangePage,
  page,
  pageSize,
  onSortChange,
  order,
  isLoading,
  notPagination,
  minWidth,
  maxHeight,
  isSelected,
  checkList,
  setCheckList,
  isSticky,
  minHeight,
  disabled,
}) {
  const theme = useTheme();
  const sprinnerStyle = {
    display: 'block',
    margin: '0 auto',
    borderColor: 'red',
  };
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  const changeSelect = async cell => {
    if (checkList?.find(e => e?.id === cell?.id)) {
      const tempCheckList = checkList?.filter(e => e?.id !== cell?.id);
      setCheckList(tempCheckList);
    } else {
      if (checkList?.length === 0) {
        setCheckList([cell]);
      } else {
        const tempCheckList = checkList;
        tempCheckList.push(cell);
        setCheckList(tempCheckList);
      }
    }
    await delay(100);
  };
  return (
    <TableContainer style={isSticky === true ? { overflowY: 'auto', maxHeight: maxHeight, minHeight: minHeight } : {}}>
      <Table
        sx={{
          minWidth: minWidth ? minWidth : 600,
          border: '1px solid #f0f0f0',
        }}
      >
        <TableHead
          sx={{
            borderTopWidth: 2,
          }}
          style={
            isSticky === true
              ? {
                  position: 'sticky',
                  zIndex: '100',
                  top: '-0px',
                  padding: '10px',
                }
              : {}
          }
        >
          <TableRow>
            {isSelected === true && (
              <TableCell
                style={{
                  textTransform: 'inherit',
                  fontSize: '0.80rem',
                }}
              >
                Seç
              </TableCell>
            )}
            {columns.map(column => (
              <TableCell
                style={{
                  textTransform: 'inherit',
                  fontSize: '0.80rem',
                }}
              >
                <div style={column.headerStyle}>
                  {column?.sortable === true ? (
                    <TableSortLabel
                      onClick={() => {
                        onSortChange({
                          columnName: column.field,
                          sort: !order.sort,
                        });
                      }}
                      active={order.columnName === column.field}
                      direction={order.columnName === column.field ? (order.sort === true ? 'asc' : 'desc') : 'desc'}
                    >
                      {column.headerName}
                      <Box component="span"></Box>
                    </TableSortLabel>
                  ) : (
                    column.headerName
                  )}
                </div>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading === true && (
            <TableRow
              style={{
                position: 'absolute',
                justifyContent: 'center',
                display: 'flex',
                left: '42%',
                top: '40%',
              }}
            >
              <TableCell align="center" colSpan={columns?.length}>
                <PuffLoader
                  color={theme.palette.primary.main}
                  loading={isLoading}
                  cssOverride={sprinnerStyle}
                  size={92}
                  aria-label="Loading Spinner"
                  data-testid="loader"
                />
              </TableCell>
            </TableRow>
          )}
          {data?.map((row, i) => {
            const isChecked = checkList?.find(e => e?.id === row?.id) ? true : false;
            return (
              <TableRow
                className={'tableCustomRow'}
                style={{
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                {isSelected === true && (
                  <TableCell
                    style={{
                      width: '80px',
                    }}
                  >
                    <Checkbox value={isChecked} disabled={disabled} onClick={() => changeSelect(row)} />
                  </TableCell>
                )}
                {columns.map(e => {
                  let tempRow = findSubElement(e, row);
                  if (tempRow) {
                    const tempColumn = columns?.find(e => e.field === tempRow.key);
                    if (tempColumn) {
                      if (tempColumn?.renderCell) {
                        return <TableCell style={tempColumn.style}>{tempColumn.renderCell(row)}</TableCell>;
                      } else {
                        return <TableCell style={tempColumn.style}>{tempRow.value}</TableCell>;
                      }
                    }
                  } else if (e.field === '') {
                    return <TableCell style={e.style}>{e.renderCell(row)}</TableCell>;
                  } else {
                    return <TableCell></TableCell>;
                  }
                })}
              </TableRow>
            );
          })}
          {notPagination !== true && (
            <TableRow>
              <TableCell sx={{ p: 2 }} colSpan={7}>
                <TablePagination
                  totalSize={totalSize}
                  pageIndex={page}
                  pageSize={pageSize}
                  onChangePage={onChangePage}
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
