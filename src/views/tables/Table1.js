import { Button } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { TableCustomPagination } from 'src/components/table/TableCustomPagination';
import { ownPagination, ownPaginationSort } from 'src/components/table/utils/TableUtils';
import { table1Data } from 'src/data/Data';

const Table1 = () => {
  const [page, setPage] = useState(1);
  const [sizePerPage, setSizePerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [pageData, setPageData] = useState();
  const [data, setData] = useState(null);
  const [totalSize, setTotalSize] = useState(0);
  const [checkList, setCheckList] = useState([]);
  const [order, setOrder] = useState({
    columnName: 'a',
    sort: true,
  });

  const columns = [
    {
      field: 'name',
      headerName: 'Ad',
      sortable: true,
      headerStyle: { fontWeight: 'bold' },
    },
    {
      field: 'surname',
      headerName: 'Soyad',
      sortable: true,
      headerStyle: { fontWeight: 'bold' },
    },
    {
      field: 'age',
      headerName: 'Yaş',
      sortable: true,
      headerStyle: { fontWeight: 'bold' },
    },
    {
      field: '',
      sortable: false,
      filterable: false,
      headerStyle: { fontWeight: 'bold' },
      renderCell: params => {
        return (
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Button variant="outlined" color="secondary" size="medium" style={{ minWidth: '0px', marginRight: '5px' }}>
              <i className="fa fa-eye" aria-hidden="true"></i>
            </Button>
          </div>
        );
      },
    },
  ];

  const onChangePagination = (event, value) => {
    setPage(value);
    setPageData(ownPagination(data, sizePerPage, value));
  };

  const onShortChange = model => {
    if (model) {
      setOrder({
        columnName: model.columnName,
        sort: model?.sort,
      });
      setPageData(ownPaginationSort(model, data, sizePerPage));
    }
  };

  useEffect(() => {
    if (!data) {
      setData(table1Data);
      setTotalSize(14);
      setPageData(ownPagination(table1Data, sizePerPage, 1));
      setPage(1);
    }
  }, [data]);

  return (
    <>
      <TableCustomPagination
        columns={columns}
        data={pageData}
        totalSize={totalSize}
        onChangePage={onChangePagination}
        page={page}
        pageSize={sizePerPage}
        order={order}
        onSortChange={onShortChange}
        isLoading={false}
      />
    </>
  );
};

export default Table1;
