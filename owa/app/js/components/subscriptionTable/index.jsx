import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import SubscriptionTableHead from './SubscriptionTableHead';
import SubscriptionTableToolbar from './SubscriptionTableToolbar';
import UrlHelper from '../../../utilities/urlHelper';
import axios from "axios/index";

let counter = 0;
function createData(name, eventType, active, description, op) {
    counter += 1;
    return {
        id: counter, name, eventType, active, description, op,
    };
}

const styles = theme => ({
    root: {
        width: '100%',
        marginTop: theme.spacing.unit * 3,
    },
    button: {
        margin: theme.spacing.unit,
    },
    table: {
        minWidth: 800,
    },
    tableWrapper: {
        overflowX: 'auto',
    },
    body: {
        fontSize: 13,
        fontFamily: [
            '"OpenSans"',
            'Arial',
            'sans-serif',
        ].join(','),
    },
});

class SubscriptionTable extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            order: 'asc',
            orderBy: 'name',
            selected: [],
            data: [].sort((a, b) => (a.name < b.name ? -1 : 1)),
            page: 0,
            rowsPerPage: 5,
        };

        this.urlHelper = new UrlHelper();
        this.handleOnPageLoad();
    }

    handleOnPageLoad = () => {
        const self = this;
        axios
            .get(this.urlHelper.apiBaseUrl() + '/notification', {
                params: {
                    v: 'full'
                }
            })
            .then(function(response) {
                let subscriptions = [];
                response.data.results.forEach((subscription) => {
                    subscriptions.push(
                        createData(subscription.name, subscription.event.name, "Yes",
                            subscription.description)
                    );
                });
                self.setState({data:subscriptions});
            })
            .catch(function(errorResponse) {
                console.log(errorResponse);
            });
    };

    handleRequestSort = (event, property) => {
        const orderBy = property;
        let order = 'desc';

        if (this.state.orderBy === property && this.state.order === 'desc') {
            order = 'asc';
        }

        const data =
            order === 'desc'
                ? this.state.data.sort((a, b) => (b[orderBy] < a[orderBy] ? -1 : 1))
                : this.state.data.sort((a, b) => (a[orderBy] < b[orderBy] ? -1 : 1));

        this.setState({ data, order, orderBy });
    };

    handleSelectAllClick = (event, checked) => {
        if (checked) {
            this.setState({ selected: this.state.data.map(n => n.id) });
            return;
        }
        this.setState({ selected: [] });
    };

    handleClick = (event, id) => {
        const { selected } = this.state;
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        this.setState({ selected: newSelected });
    };

    handleChangePage = (event, page) => {
        this.setState({ page });
    };

    handleChangeRowsPerPage = (event) => {
        this.setState({ rowsPerPage: event.target.value });
    };

    isSelected = id => this.state.selected.indexOf(id) !== -1;

    render() {
        const { classes } = this.props;
        const {
            data, order, orderBy, selected, rowsPerPage, page,
        } = this.state;
        const emptyRows = rowsPerPage - Math.min(rowsPerPage, (data.length - (page * rowsPerPage)));

        return (
            <div id="body-wrapper" className="body-wrapper">
                <Paper className={classes.root}>
                    <SubscriptionTableToolbar numSelected={selected.length} />
                    <div className={classes.tableWrapper}>
                        <Table className={classes.table} aria-labelledby="tableTitle">
                            <SubscriptionTableHead
                                numSelected={selected.length}
                                order={order}
                                orderBy={orderBy}
                                onSelectAllClick={this.handleSelectAllClick}
                                onRequestSort={this.handleRequestSort}
                                rowCount={data.length}
                            />
                            <TableBody>
                                {data.slice(page * rowsPerPage, ((page * rowsPerPage) + rowsPerPage)).map((n) => {
                                    const isSelected = this.isSelected(n.id);
                                    return (
                                        <TableRow
                                            hover
                                            onClick={event => this.handleClick(event, n.id)}
                                            role="checkbox"
                                            aria-checked={isSelected}
                                            tabIndex={-1}
                                            key={n.id}
                                            selected={isSelected}
                                        >
                                            <TableCell padding="checkbox" className={classes.body}>
                                                <Checkbox checked={isSelected} />
                                            </TableCell>
                                            <TableCell component="th" scope="row" padding="none" className={classes.body}>
                                                {n.name}
                                            </TableCell>
                                            <TableCell numeric className={classes.body}>{n.eventType}</TableCell>
                                            <TableCell numeric className={classes.body}>{n.active}</TableCell>
                                            <TableCell numeric className={classes.body}>{n.description}</TableCell>
                                            <TableCell numeric className={classes.body}>
                                                <Link
                                                    to={`${this.urlHelper.owaPath()}/subscription`}>
                                                    Edit
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {emptyRows > 0 && (
                                    <TableRow style={{ height: 49 * emptyRows }}>
                                        <TableCell colSpan={6} />
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <TablePagination
                        component="div"
                        count={data.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        backIconButtonProps={{
                            'aria-label': 'Previous Page',
                        }}
                        nextIconButtonProps={{
                            'aria-label': 'Next Page',
                        }}
                        onChangePage={this.handleChangePage}
                        onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    />
                </Paper>
            </div>
        );
    }
}

SubscriptionTable.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SubscriptionTable);
