/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

package com.liferay.user.associated.data.util;

import java.util.List;

/**
 * @author William Newbury
 */
public class UADEntitySetComposite {

	public UADEntitySetComposite(
		long userId, String uadEntitySetName,
		List<UADEntityTypeComposite> uadEntityTypeComposites) {

		_userId = userId;
		_uadEntitySetName = uadEntitySetName;
		_uadEntityTypeComposites = uadEntityTypeComposites;
	}

	public int getCount() {
		int count = 0;

		for (UADEntityTypeComposite uadEntityTypeComposite :
				_uadEntityTypeComposites) {

			count += uadEntityTypeComposite.getCount();
		}

		return count;
	}

	public String getStatusLabel() {
		if (getCount() == 0) {
			return "complete";
		}

		return "incomplete";
	}

	public String getUADEntitySetName() {
		return _uadEntitySetName;
	}

	public List<UADEntityTypeComposite> getUADEntityTypeComposites() {
		return _uadEntityTypeComposites;
	}

	public long getUserId() {
		return _userId;
	}

	private final String _uadEntitySetName;
	private final List<UADEntityTypeComposite> _uadEntityTypeComposites;
	private final long _userId;

}