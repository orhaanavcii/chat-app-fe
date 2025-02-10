// material-ui
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';

export const CustomPagination = ({ page, totalSize, onChangePagination }) => {
  return (
    <Pagination
      color="primary"
      variant="outlined"
      shape="rounded"
      page={page + 1}
      count={totalSize % 10 === 0 ? totalSize / 10 : Math.trunc(totalSize / 10) + 1}
      // @ts-expect-error
      renderItem={props2 => <PaginationItem {...props2} disableRipple />}
      onChange={onChangePagination}
    />
  );
};
