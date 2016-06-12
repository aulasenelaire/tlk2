import React, { Component, PropTypes } from 'react';
import _ from 'underscore';
import moment from 'moment';

import styles from './styles';

class Percentils extends Component {
  render() {
    const { sessions } = this.props;

    const sessionTables = sessions.map((session) => {
      const { tlk_metadata: meta } = session;

      const percentils = Object.keys(meta.percentils).map((key, index) => {
        const percentil = meta.percentils[key];

        return (
          <tr key={key}>
            <td>{key}</td>
            <td>{parseFloat(percentil.activities_media).toFixed(2)}</td>
            <td>
              {percentil.tlk_percentil.key}&nbsp;
              ({percentil.tlk_percentil.value})
            </td>
          </tr>
        );
      });

      return (
        <table key={session.id} className={styles.session}>
          <caption>
            <strong>{session.name}</strong>&nbsp;
            / <small><strong>ID: </strong>{session.id}</small>
            / <small><strong>Creada: </strong>{moment(meta.creationTime).format('YYYY-MM-DD')}</small>
            / <small><strong>Curso: </strong>{meta.course}</small>
            / <small><strong>Trimestre: </strong>{meta.trimester.name}</small>
          </caption>
          <thead>
            <tr>
              <th></th>
              <th>Palabra por minuto (media)</th>
              <th>Percentil</th>
            </tr>
          </thead>
          <tbody>{percentils}</tbody>
        </table>
      );
    });

    return (
      <div>{sessionTables}</div>
    );
  }
}

Percentils.propTypes = {
  sessions: PropTypes.array,
};

export default Percentils;
