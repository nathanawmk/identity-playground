import React, { Component } from 'react'

import decodeFn from 'utils/decodeFn'
import ClaimHolder from '../../contracts/ClaimHolder'

import Loading from 'components/Loading'
import ValidateClaim from './_ValidateClaim'

import { claimType, keyPurpose, keyType } from 'actions/Identity'

class IdentitySummary extends Component {
  render() {
    return (
      <div className="mt-3 position-relative">
        <Loading show={this.props.response === null} />
        {this.renderKeys()}
        {this.renderClaims()}
      </div>
    )
  }

  renderKeys() {
    var keys = this.props.events.filter(
      e =>
        e.event === 'KeyAdded' &&
        !this.props.events.find(
          ex =>
            ex.event === 'KeyRemoved' &&
            ex.returnValues.key === e.returnValues.key
        )
    )

    return (
      <table className="table table-sm">
        <thead>
          <tr>
            <th>
              Keys{this.props.isOwner && (
                <a
                  href="#"
                  className="ml-2"
                  onClick={e => {
                    e.preventDefault()
                    this.props.onAddKey()
                  }}
                >
                  <i className="fa fa-plus" />
                </a>
              )}
            </th>
            <th>Purpose</th>
            <th>Type</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {keys.length ? null : (
            <tr>
              <td colSpan={4}>No Keys</td>
            </tr>
          )}
          {keys.map((key, idx) => (
            <tr key={idx}>
              <td>{`${key.returnValues.key.substr(0, 8)}...`}</td>
              <td>{keyPurpose(key.returnValues.purpose)}</td>
              <td>{keyType(key.returnValues.keyType)}</td>
              <td className="text-right">
                {this.props.isOwner && (
                  <a
                    href="#"
                    className="btn btn-sm btn-outline-danger"
                    onClick={e => {
                      e.preventDefault()
                      this.props.onRemoveKey(key.returnValues.key)
                    }}
                  >
                    <i className="fa fa-trash" />
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  renderClaims() {
    var claims = [],
      executionReqs = []

    this.props.events.forEach(e => {
      if (e.event === 'ClaimAdded') {
        claims.push(e)
      }
      if (e.event === 'ClaimRemoved') {
        claims = claims.filter(
          c => c.returnValues.claimId !== e.returnValues.claimId
        )
      }
      if (e.event === 'ExecutionRequested') {
        executionReqs.push(e)
      }
      if (e.event === 'Executed') {
        executionReqs = executionReqs.filter(
          c => c.returnValues.executionId !== e.returnValues.executionId
        )
      }
    })

    return (
      <table className="table table-sm">
        <thead>
          <tr>
            <th>
              Claims{this.props.isOwner && (
                <a
                  href="#"
                  className="ml-2"
                  onClick={e => {
                    e.preventDefault()
                    this.props.onAddClaim()
                  }}
                >
                  <i className="fa fa-plus" />
                </a>
              )}
            </th>
            <th>From</th>
            <th>URI</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {claims.length || executionReqs.length ? null : (
            <tr>
              <td colSpan={3}>No Claims</td>
            </tr>
          )}
          {claims.map((claim, idx) => (
            <tr key={`c-${idx}`}>
              <td>
                {claimType(claim.returnValues.claimType)}{' '}
                <ValidateClaim claim={claim.returnValues} />
              </td>
              <td>
                {this.props.names[claim.returnValues.issuer] ||
                  String(claim.returnValues.issuer).substr(0, 8)}
              </td>
              <td>{claim.returnValues.uri}</td>
              <td className="text-right">
                {this.props.isOwner && (
                  <a
                    href="#"
                    className="btn btn-sm btn-outline-danger"
                    onClick={e => {
                      e.preventDefault()
                      this.props.onRemoveClaim(claim.returnValues.claimId)
                    }}
                  >
                    <i className="fa fa-trash" />
                  </a>
                )}
              </td>
            </tr>
          ))}
          {executionReqs.map((exec, idx) => {
            var decoded = decodeFn(ClaimHolder, exec.returnValues.data)
            return (
              <tr
                key={`e-${idx}`}
                className={
                  this.props.isOwner ? 'table-warning' : 'table-secondary'
                }
              >
                <td>{claimType(decoded.params._claimType)}</td>
                <td>
                  {this.props.names[decoded.params._issuer] ||
                    decoded.params._issuer}
                </td>
                <td>{decoded.params._uri}</td>
                <td className="text-right pr-3">
                  {this.props.isOwner ? (
                    <a
                      className="font-weight-bold"
                      href="#"
                      onClick={e => {
                        e.preventDefault()
                        this.props.approveExecution(
                          exec.returnValues.executionId
                        )
                      }}
                    >
                      Approve
                    </a>
                  ) : (
                    <span>Un-Approved</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }
}

export default IdentitySummary