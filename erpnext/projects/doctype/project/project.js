// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

frappe.ui.form.on("Project", {
	onload: function(frm) {
		var so = frappe.meta.get_docfield("Project", "sales_order");
		so.get_route_options_for_new_doc = function(field) {
			if(frm.is_new()) return;
			return {
				"customer": frm.doc.customer,
				"project_name": frm.doc.name
			}
		}

		frm.set_query('customer', 'erpnext.controllers.queries.customer_query');

		// sales order
		frm.set_query('sales_order', function() {
			var filters = {
				'project': ["in", frm.doc.__islocal ? [""] : [frm.doc.name, ""]]
			};

			if (frm.doc.customer) {
				filters["customer"] = frm.doc.customer;
			}

			return {
				filters: filters
			}
		});
	},
	refresh: function(frm) {
		if(frm.doc.__islocal) {
			frm.web_link && frm.web_link.remove();
		} else {
			frm.add_web_link("/projects?project=" + encodeURIComponent(frm.doc.name));

			if(frappe.model.can_read("Task")) {
				frm.add_custom_button(__("Gantt Chart"), function() {
					frappe.route_options = {"project": frm.doc.name,
						"start": frm.doc.expected_start_date, "end": frm.doc.expected_end_date};
					frappe.set_route("Gantt", "Task");
				});
			}

			frm.trigger('show_dashboard');
		}
	},
	show_dashboard: function(frm) {
		frm.dashboard.show_heatmap = true;
		frm.dashboard.heatmap_message = __('This is based on the Time Logs created against this project');
		frm.dashboard.show_dashboard();

		if(frm.doc.__onload.activity_summary.length) {
			var hours = $.map(frm.doc.__onload.activity_summary, function(d) { return d.total_hours });
			var max_count = Math.max.apply(null, hours);
			var sum = hours.reduce(function(a, b) { return a + b; }, 0);
			var section = frm.dashboard.add_section(
				frappe.render_template('project_dashboard',
					{
						data: frm.doc.__onload.activity_summary,
						max_count: max_count,
						sum: sum
					}));

			section.on('click', '.time-log-link', function() {
				var activity_type = $(this).attr('data-activity_type');
				frappe.set_route('List', 'Time Log',
					{'activity_type': activity_type, 'project': frm.doc.name});
			});
		}
	}
});

frappe.ui.form.on("Project Task", "edit_task", function(frm, doctype, name) {
	var doc = frappe.get_doc(doctype, name);
	if(doc.task_id) {
		frappe.set_route("Form", "Task", doc.task_id);
	} else {
		msgprint(__("Save the document first."));
	}
})

