import { Grid, Pagination } from '@mui/material';

export const ownPagination = (data, sizePerPage, pageNumber) => {
  const firstPageIndex = (pageNumber - 1) * sizePerPage;
  const lastPageIndex = firstPageIndex + sizePerPage;
  return data?.slice(firstPageIndex, lastPageIndex);
};

export const ownPaginationSort = (model, data, sizePerPage) => {
  if (model?.sort === true) {
    const sortedData = data?.sort((a, b) => {
      if (Number(a[model.columnName])) {
        if (a[model.columnName] > b[model.columnName]) return 1;
        if (a[model.columnName] < b[model.columnName]) return -1;
        return 0;
      } else {
        if (String(a[model.columnName])?.toLowerCase() > String(b[model.columnName])?.toLowerCase()) return 1;
        if (String(a[model.columnName])?.toLowerCase() < String(b[model.columnName])?.toLowerCase()) return -1;
        return 0;
      }
    });
    return ownPagination(sortedData, sizePerPage || 10, 1);
  } else {
    const sortedData = data?.sort((a, b) => {
      if (Number(a[model.columnName])) {
        if (a[model.columnName] < b[model.columnName]) return 1;
        if (a[model.columnName] > b[model.columnName]) return -1;
        return 0;
      } else {
        if (String(a[model.columnName])?.toLowerCase() < String(b[model.columnName])?.toLowerCase()) return 1;
        if (String(a[model.columnName])?.toLowerCase() > String(b[model.columnName])?.toLowerCase()) return -1;
        return 0;
      }
    });
    return ownPagination(sortedData, sizePerPage || 10, 1);
  }
};

export const TablePagination = ({ pageSize, pageIndex, totalSize, onChangePage }) => {
  return (
    <Grid container alignItems="center" justifyContent="right" sx={{ width: 'auto' }}>
      <Grid item sx={{ mt: { xs: 2, sm: 0 } }} textAlign="right">
        <Pagination
          // @ts-ignore
          count={Math.ceil(totalSize / pageSize)}
          // @ts-ignore
          page={pageIndex}
          onChange={onChangePage}
          color="primary"
          variant="outlined"
          showFirstButton
          showLastButton
        />
      </Grid>
    </Grid>
  );
};

export const findSubElement = (data, row) => {
  let tempRow;
  if (data.field?.includes('.')) {
    const fields = data.field.split('.');
    if (fields?.length === 2) {
      tempRow = {
        key: data.field,
        value: row[fields[0]][fields[1]],
      };
    } else if (fields?.length === 3) {
      tempRow = {
        key: data.field,
        value: row[fields[0]][fields[1]][fields[2]],
      };
    } else if (fields?.length === 4) {
      tempRow = {
        key: data.field,
        value: row[fields[0]][fields[1]][fields[2]][fields[3]],
      };
    } else if (fields?.length === 5) {
      tempRow = {
        key: data.field,
        value: row[fields[0]][fields[1]][fields[2]][fields[3]][fields[4]],
      };
    } else if (fields?.length === 6) {
      tempRow = {
        key: data.field,
        value: row[fields[0]][fields[1]][fields[2]][fields[3]][fields[4]][fields[5]],
      };
    }
  } else {
    // eslint-disable-next-line no-unused-vars
    tempRow = Object.entries(row)
      .map(([key, value]) => {
        return { key, value };
      })
      .find(x => x.key === data.field);
  }
  return tempRow;
};
